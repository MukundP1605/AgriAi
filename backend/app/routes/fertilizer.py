from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime
import httpx
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO

from app.database import get_db
from app.schemas.fertilizer import (
    SoilTestRequest,
    FertilizerRecommendationResponse,
    NPKAnalysis,
    ApplicationSchedule,
    MarketplaceMatch
)
from app.models.fertilizer import FertilizerHistory
from app.utils.fertilizer_ai import (
    analyze_soil_data,
    generate_npk_recommendation,
    create_application_schedule,
    match_marketplace_products
)
from app.utils.auth import get_current_active_user
from app.models.users import DBUser

router = APIRouter()

@router.post("/fertilizer-ai", response_model=FertilizerRecommendationResponse)
async def get_fertilizer_recommendation(
    soil_data: SoilTestRequest,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Main fertilizer AI endpoint that provides comprehensive fertilizer recommendations
    based on soil test data and crop requirements.
    """
    try:
        # Step 1: Validate soil data
        if not validate_soil_data(soil_data):
            raise HTTPException(status_code=400, detail="Invalid soil data values")
        
        # Step 2: AI Analysis - Generate NPK recommendation
        npk_analysis = await generate_npk_recommendation(soil_data)
        
        # Step 3: Create application schedule
        application_schedule = create_application_schedule(
            npk_analysis, 
            soil_data.crop_type,
            soil_data.organic_preference
        )
        
        # Step 4: Match marketplace products
        marketplace_matches = await match_marketplace_products(
            npk_analysis, 
            soil_data.organic_preference,
            db
        )
        
        # Step 5: Save to database for history
        fertilizer_record = FertilizerHistory(
            user_id=current_user.id,
            crop_type=soil_data.crop_type,
            soil_data=json.dumps(soil_data.dict()),
            npk_recommendation=json.dumps(npk_analysis.dict()),
            application_schedule=json.dumps([schedule.dict() for schedule in application_schedule]),
            organic_preference=soil_data.organic_preference,
            confidence_score=npk_analysis.confidence_score,
            created_at=datetime.utcnow()
        )
        
        db.add(fertilizer_record)
        db.commit()
        
        return FertilizerRecommendationResponse(
            npk_analysis=npk_analysis,
            application_schedule=application_schedule,
            marketplace_matches=marketplace_matches,
            request_id=fertilizer_record.id,
            confidence_score=npk_analysis.confidence_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer AI processing failed: {str(e)}")

@router.post("/upload-soil-report")
async def upload_soil_report(
    file: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_active_user)
):
    """
    Upload soil report (PDF/Image) and extract data using OCR
    """
    try:
        if not file.filename.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="Only PDF and image files are supported")
        
        # Save file temporarily
        upload_dir = "app/temp/soil_reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # TODO: Implement OCR extraction here
        # For now, return file info
        return {
            "message": "Soil report uploaded successfully",
            "file_path": file_path,
            "filename": file.filename,
            "size": len(content),
            "note": "OCR extraction will be implemented in next phase"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/analyze-soil-report")
async def analyze_soil_report(
    file_path: str,
    crop_type: str = "rice",
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Analyze uploaded soil report PDF/image using OCR and provide fertilizer recommendations
    """
    try:
        # Import OCR libraries (you may need to install these)
        try:
            import pytesseract
            from PIL import Image
            import pdf2image
            
            # Configure Tesseract path for Windows
            if os.name == 'nt':  # Windows
                possible_paths = [
                    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                    r'C:\Program Files\tesseract-ocr-tesseract-0995615\tesseract.exe',
                    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
                ]
                
                for path in possible_paths:
                    if os.path.exists(path):
                        pytesseract.pytesseract.tesseract_cmd = path
                        break
                else:
                    # Try to find tesseract in PATH
                    import shutil
                    if not shutil.which('tesseract'):
                        raise HTTPException(
                            status_code=501,
                            detail="Tesseract OCR not found. Please install Tesseract and ensure it's in your PATH or located in a standard directory."
                        )
            
        except ImportError:
            raise HTTPException(
                status_code=501, 
                detail="OCR functionality not available. Please install pytesseract, PIL, and pdf2image packages."
            )
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Uploaded file not found")
        
        extracted_text = ""
        
        # Handle PDF files
        if file_path.lower().endswith('.pdf'):
            # Convert PDF to images
            images = pdf2image.convert_from_path(file_path)
            for image in images:
                # Extract text from each page
                text = pytesseract.image_to_string(image, config='--psm 6')
                extracted_text += text + "\n"
        else:
            # Handle image files directly
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image, config='--psm 6')
        
        # Parse extracted text to find soil data
        parsed_data = parse_soil_report_text(extracted_text)
        
        if not parsed_data:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract valid soil data from the report. Please ensure the report contains NPK values, pH, and other soil parameters."
            )
        
        # Create soil test request from parsed data
        from app.schemas.fertilizer import SoilTestRequest
        soil_request = SoilTestRequest(
            nitrogen=parsed_data.get('nitrogen', 50),
            phosphorus=parsed_data.get('phosphorus', 30),
            potassium=parsed_data.get('potassium', 40),
            ph=parsed_data.get('ph', 6.5),
            organic_matter=parsed_data.get('organic_matter', 2.5),
            moisture=parsed_data.get('moisture', 20),
            crop_type=crop_type,
            field_size=1.0,  # Default to 1 hectare
            location=parsed_data.get('location', 'Unknown'),
            organic_preference=False
        )
        
        # Generate fertilizer recommendation using existing logic
        npk_analysis = await generate_npk_recommendation(soil_request)
        application_schedule = create_application_schedule(
            npk_analysis, 
            crop_type,
            False  # organic_preference
        )
        marketplace_matches = await match_marketplace_products(
            npk_analysis, 
            False,  # organic_preference
            db
        )
        
        # Save analysis to database
        fertilizer_record = FertilizerHistory(
            user_id=current_user.id,
            crop_type=crop_type,
            soil_data=json.dumps(soil_request.dict()),
            npk_recommendation=json.dumps(npk_analysis.dict()),
            application_schedule=json.dumps([schedule.dict() for schedule in application_schedule]),
            organic_preference=False,
            confidence_score=npk_analysis.confidence_score,
            created_at=datetime.utcnow()
        )
        
        db.add(fertilizer_record)
        db.commit()
        
        return {
            "message": "Soil report analyzed successfully",
            "extracted_data": parsed_data,
            "npk_analysis": npk_analysis,
            "application_schedule": application_schedule,
            "marketplace_matches": marketplace_matches,
            "confidence_score": npk_analysis.confidence_score,
            "request_id": fertilizer_record.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def parse_soil_report_text(text: str) -> Dict[str, float]:
    """
    Parse extracted OCR text to find soil parameters
    This is a simplified parser - you may want to enhance it based on your soil report formats
    """
    import re
    
    parsed_data = {}
    
    try:
        # Look for NPK values (various formats)
        # N, P, K patterns
        n_match = re.search(r'(?:nitrogen|n)\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if n_match:
            parsed_data['nitrogen'] = float(n_match.group(1))
        
        p_match = re.search(r'(?:phosphorus|phosphorous|p)\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if p_match:
            parsed_data['phosphorus'] = float(p_match.group(1))
        
        k_match = re.search(r'(?:potassium|k)\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if k_match:
            parsed_data['potassium'] = float(k_match.group(1))
        
        # pH patterns
        ph_match = re.search(r'ph\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if ph_match:
            parsed_data['ph'] = float(ph_match.group(1))
        
        # Organic matter patterns
        om_match = re.search(r'(?:organic\s*matter|om)\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if om_match:
            parsed_data['organic_matter'] = float(om_match.group(1))
        
        # Moisture patterns
        moisture_match = re.search(r'moisture\s*:?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if moisture_match:
            parsed_data['moisture'] = float(moisture_match.group(1))
        
        # Location patterns
        location_match = re.search(r'(?:location|site|field)\s*:?\s*([a-zA-Z\s,]+)', text, re.IGNORECASE)
        if location_match:
            parsed_data['location'] = location_match.group(1).strip()
        
    except Exception as e:
        print(f"Error parsing soil report text: {e}")
    
    return parsed_data

@router.get("/test-ocr")
async def test_ocr_installation():
    """
    Test OCR installation and configuration
    """
    try:
        import pytesseract
        from PIL import Image
        import pdf2image
        
        # Configure Tesseract path for Windows
        if os.name == 'nt':  # Windows
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files\tesseract-ocr-tesseract-0995615\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
            ]
            
            tesseract_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    tesseract_path = path
                    break
        
        # Test Tesseract installation
        try:
            version = pytesseract.get_tesseract_version()
            return {
                "status": "success",
                "message": "OCR functionality is available",
                "tesseract_version": str(version),
                "tesseract_path": tesseract_path or "System PATH",
                "libraries": {
                    "pytesseract": "Available",
                    "PIL": "Available", 
                    "pdf2image": "Available"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Tesseract not properly configured: {str(e)}",
                "tesseract_path": tesseract_path,
                "suggestion": "Please check Tesseract installation or PATH configuration"
            }
            
    except ImportError as e:
        return {
            "status": "error",
            "message": "Required OCR libraries not installed",
            "missing_library": str(e),
            "solution": "Run: pip install pytesseract Pillow pdf2image"
        }

@router.get("/fertilizer-history")
async def get_fertilizer_history(
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """
    Get user's fertilizer recommendation history
    """
    try:
        history = db.query(FertilizerHistory).filter(
            FertilizerHistory.user_id == current_user.id
        ).order_by(FertilizerHistory.created_at.desc()).offset(offset).limit(limit).all()
        
        return [
            {
                "id": record.id,
                "crop_type": record.crop_type,
                "confidence_score": record.confidence_score,
                "organic_preference": record.organic_preference,
                "created_at": record.created_at.isoformat(),
                "soil_data": json.loads(record.soil_data) if record.soil_data else {},
                "npk_recommendation": json.loads(record.npk_recommendation) if record.npk_recommendation else {}
            }
            for record in history
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@router.post("/download-report")
async def download_fertilizer_report(
    report_data: Dict[str, Any],
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate and download a comprehensive PDF report of fertilizer recommendations
    """
    try:
        # Get the most recent fertilizer recommendation for this user
        latest_record = db.query(FertilizerHistory).filter(
            FertilizerHistory.user_id == current_user.id
        ).order_by(FertilizerHistory.created_at.desc()).first()
        
        if not latest_record:
            raise HTTPException(status_code=404, detail="No fertilizer recommendation found. Please run an analysis first.")
        
        # Parse the stored data
        soil_data = json.loads(latest_record.soil_data) if latest_record.soil_data else {}
        npk_data = json.loads(latest_record.npk_recommendation) if latest_record.npk_recommendation else {}
        
        # Simplified PDF generation
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        story.append(Paragraph("AgriAI Fertilizer Recommendation Report", styles['Title']))
        story.append(Spacer(1, 12))

        # Report metadata
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        story.append(Paragraph(f"For: {current_user.email}", styles['Normal']))
        story.append(Paragraph(f"Analysis Date: {latest_record.created_at.strftime('%Y-%m-%d %H:%M') if latest_record.created_at else 'N/A'}", styles['Normal']))
        story.append(Spacer(1, 20))

        # Soil data summary  
        story.append(Paragraph("Soil Test Results", styles['Heading2']))
        story.append(Paragraph(f"Nitrogen (N): {soil_data.get('nitrogen', 'N/A')} mg/kg", styles['Normal']))
        story.append(Paragraph(f"Phosphorus (P): {soil_data.get('phosphorus', 'N/A')} mg/kg", styles['Normal']))
        story.append(Paragraph(f"Potassium (K): {soil_data.get('potassium', 'N/A')} mg/kg", styles['Normal']))
        story.append(Paragraph(f"pH Level: {soil_data.get('ph', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"Moisture: {soil_data.get('moisture', 'N/A')}%", styles['Normal']))
        story.append(Paragraph(f"Crop Type: {soil_data.get('crop_type', 'N/A').title()}", styles['Normal']))
        story.append(Paragraph(f"Field Size: {soil_data.get('field_size', 'N/A')} hectares", styles['Normal']))
        story.append(Paragraph(f"Location: {soil_data.get('location', 'N/A')}", styles['Normal']))
        story.append(Spacer(1, 20))        # Analysis results
        story.append(Paragraph("NPK Analysis Results", styles['Heading2']))
        
        # Get NPK recommendations from database
        current_npk = npk_data.get('current_npk', {})
        recommended_npk = npk_data.get('recommended_npk', {})
        deficiency_analysis = npk_data.get('deficiency_analysis', {})
        
        # Current soil NPK levels
        story.append(Paragraph("Current Soil NPK Levels:", styles['Heading3']))
        story.append(Paragraph(f"Nitrogen (N): {current_npk.get('N', soil_data.get('nitrogen', 0))} mg/kg", styles['Normal']))
        story.append(Paragraph(f"Phosphorus (P): {current_npk.get('P', soil_data.get('phosphorus', 0))} mg/kg", styles['Normal']))
        story.append(Paragraph(f"Potassium (K): {current_npk.get('K', soil_data.get('potassium', 0))} mg/kg", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Recommended NPK application
        story.append(Paragraph("Recommended NPK Application:", styles['Heading3']))
        story.append(Paragraph(f"Nitrogen (N): {recommended_npk.get('N', 0)} kg/ha", styles['Normal']))
        story.append(Paragraph(f"Phosphorus (P): {recommended_npk.get('P', 0)} kg/ha", styles['Normal']))
        story.append(Paragraph(f"Potassium (K): {recommended_npk.get('K', 0)} kg/ha", styles['Normal']))
        story.append(Paragraph(f"Confidence Score: {latest_record.confidence_score}%", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Deficiency analysis
        if deficiency_analysis:
            story.append(Paragraph("Nutrient Deficiency Analysis:", styles['Heading3']))
            for nutrient, details in deficiency_analysis.items():
                if isinstance(details, dict):
                    status = details.get('status', 'Unknown')
                    severity = details.get('severity', 'Unknown')
                    story.append(Paragraph(f"{nutrient}: {status} (Severity: {severity})", styles['Normal']))
                else:
                    story.append(Paragraph(f"{nutrient}: {details}", styles['Normal']))
            story.append(Spacer(1, 20))        # Application schedule
        schedule_data = npk_data.get('schedule', [])
        if schedule_data:
            story.append(Paragraph("Application Schedule", styles['Heading2']))
            for i, phase in enumerate(schedule_data, 1):
                story.append(Paragraph(f"Phase {i}: {phase.get('phase', '').title()}", styles['Heading3']))
                story.append(Paragraph(f"Timing: {phase.get('timing', 'N/A')}", styles['Normal']))
                story.append(Paragraph(f"Nitrogen: {phase.get('nitrogen_kg_per_ha', 0)} kg/ha", styles['Normal']))
                story.append(Paragraph(f"Phosphorus: {phase.get('phosphorus_kg_per_ha', 0)} kg/ha", styles['Normal']))
                story.append(Paragraph(f"Potassium: {phase.get('potassium_kg_per_ha', 0)} kg/ha", styles['Normal']))
                story.append(Paragraph(f"Method: {phase.get('application_method', 'N/A')}", styles['Normal']))
                story.append(Spacer(1, 12))
        else:
            story.append(Paragraph("Application Schedule", styles['Heading2']))
            story.append(Paragraph("No detailed application schedule available. Apply recommended NPK amounts based on crop growth stages.", styles['Normal']))
            story.append(Spacer(1, 20))
        
        # Product recommendations
        products = npk_data.get('products', [])
        if products:
            story.append(Paragraph("Recommended Products", styles['Heading2']))
            for product in products:
                story.append(Paragraph(f"• {product.get('name', 'Unknown Product')}", styles['Normal']))
                story.append(Paragraph(f"  NPK Ratio: {product.get('npk_ratio', 'N/A')}", styles['Normal']))
                story.append(Paragraph(f"  Application Rate: {product.get('application_rate', 'N/A')}", styles['Normal']))
                story.append(Paragraph(f"  Price: ${product.get('price', 'N/A')}", styles['Normal']))
                story.append(Spacer(1, 8))
            story.append(Spacer(1, 12))

        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("Generated by AgriAI - Your Intelligent Farming Companion", styles['Normal']))

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=fertilizer-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.pdf"
            }
        )
        
    except Exception as e:
        print(f"PDF generation error: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

def validate_soil_data(soil_data: SoilTestRequest) -> bool:
    """Validate soil data values are within acceptable ranges"""
    try:
        # NPK values should be 0-300 (mg/kg or ppm)
        if not (0 <= soil_data.nitrogen <= 300):
            return False
        if not (0 <= soil_data.phosphorus <= 300):
            return False
        if not (0 <= soil_data.potassium <= 300):
            return False
        
        # pH should be 3.0-10.0
        if not (3.0 <= soil_data.ph <= 10.0):
            return False
        
        # Moisture should be 0-100%
        if not (0 <= soil_data.moisture <= 100):
            return False
        
        return True
    except:
        return False
# Updated 2026-07-13 19:38:59
# Updated 2026-07-13 19:39:19
