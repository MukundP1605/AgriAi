import os
import json
import httpx
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.schemas.fertilizer import (
    SoilTestRequest, 
    NPKAnalysis, 
    ApplicationPhase, 
    MarketplaceMatch,
    OrganicPreference,
    CropType
)
from app.database import Product as ProductModel

# Crop-specific NPK requirements database
CROP_NPK_REQUIREMENTS = {
    "rice": {"N": {"min": 80, "max": 120}, "P": {"min": 40, "max": 60}, "K": {"min": 40, "max": 60}},
    "wheat": {"N": {"min": 100, "max": 140}, "P": {"min": 50, "max": 70}, "K": {"min": 30, "max": 50}},
    "corn": {"N": {"min": 150, "max": 200}, "P": {"min": 60, "max": 80}, "K": {"min": 60, "max": 80}},
    "tomato": {"N": {"min": 120, "max": 180}, "P": {"min": 80, "max": 120}, "K": {"min": 100, "max": 150}},
    "potato": {"N": {"min": 100, "max": 150}, "P": {"min": 50, "max": 80}, "K": {"min": 120, "max": 180}},
    "cotton": {"N": {"min": 120, "max": 160}, "P": {"min": 60, "max": 80}, "K": {"min": 60, "max": 100}},
    "sugarcane": {"N": {"min": 200, "max": 250}, "P": {"min": 60, "max": 80}, "K": {"min": 80, "max": 120}},
    "soybean": {"N": {"min": 30, "max": 50}, "P": {"min": 60, "max": 80}, "K": {"min": 80, "max": 120}},
    "other": {"N": {"min": 80, "max": 120}, "P": {"min": 50, "max": 70}, "K": {"min": 50, "max": 80}}
}

async def generate_npk_recommendation(soil_data: SoilTestRequest) -> NPKAnalysis:
    """
    Generate NPK recommendation using AI analysis
    """
    try:
        # Get crop requirements
        crop_requirements = CROP_NPK_REQUIREMENTS.get(
            soil_data.crop_type.value, 
            CROP_NPK_REQUIREMENTS["other"]
        )
        
        # Current NPK levels
        current_npk = {
            "N": soil_data.nitrogen,
            "P": soil_data.phosphorus,
            "K": soil_data.potassium
        }
        
        # Calculate recommendations based on deficiency
        recommended_npk = {}
        deficiency_analysis = {}
        
        for nutrient in ["N", "P", "K"]:
            current_level = current_npk[nutrient]
            optimal_min = crop_requirements[nutrient]["min"]
            optimal_max = crop_requirements[nutrient]["max"]
            
            if current_level < optimal_min:
                deficit = optimal_min - current_level
                recommended_npk[nutrient] = deficit * 1.2  # Add 20% buffer
                deficiency_analysis[nutrient] = f"Deficient by {deficit:.1f} mg/kg. Requires supplementation."
            elif current_level > optimal_max:
                recommended_npk[nutrient] = 0
                deficiency_analysis[nutrient] = f"Excessive by {current_level - optimal_max:.1f} mg/kg. Avoid this nutrient."
            else:
                recommended_npk[nutrient] = optimal_min * 0.3  # Maintenance dose
                deficiency_analysis[nutrient] = f"Within optimal range. Maintenance application recommended."
        
        # Calculate confidence score based on soil data completeness
        confidence_factors = []
        confidence_factors.append(90)  # Base confidence
        
        if soil_data.organic_matter:
            confidence_factors.append(5)
        if soil_data.soil_texture:
            confidence_factors.append(3)
        if soil_data.previous_crop:
            confidence_factors.append(2)
        
        confidence_score = min(100, sum(confidence_factors))
        
        # Use AI for more sophisticated analysis (OpenRouter API)
        ai_analysis = await get_ai_fertilizer_analysis(soil_data, current_npk, recommended_npk)
        
        return NPKAnalysis(
            current_npk=current_npk,
            recommended_npk=recommended_npk,
            deficiency_analysis=deficiency_analysis,
            optimal_range=crop_requirements,
            confidence_score=confidence_score
        )
        
    except Exception as e:
        raise Exception(f"NPK analysis failed: {str(e)}")

async def get_ai_fertilizer_analysis(soil_data: SoilTestRequest, current_npk: Dict, recommended_npk: Dict) -> str:
    """
    Get AI-powered fertilizer analysis using OpenRouter API
    """
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return "AI analysis unavailable - API key not configured"
        
        prompt = f"""
        As an agricultural expert, analyze this soil test data and provide fertilizer recommendations:
        
        Crop: {soil_data.crop_type.value}
        Location: {soil_data.location}
        Current NPK levels: N={current_npk['N']}, P={current_npk['P']}, K={current_npk['K']} mg/kg
        Soil pH: {soil_data.ph}
        Moisture: {soil_data.moisture}%
        Organic preference: {soil_data.organic_preference.value}
        
        Calculated NPK needs: N={recommended_npk['N']:.1f}, P={recommended_npk['P']:.1f}, K={recommended_npk['K']:.1f} mg/kg
        
        Provide specific fertilizer recommendations including:
        1. Best NPK ratio for this crop and soil
        2. Application timing and method
        3. Organic vs chemical considerations
        4. Expected yield improvement
        
        Keep response concise and practical.
        """
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                return "AI analysis unavailable at this time"
                
    except Exception as e:
        return f"AI analysis error: {str(e)}"

def create_application_schedule(
    npk_analysis: NPKAnalysis, 
    crop_type: str, 
    organic_preference: OrganicPreference
) -> List[ApplicationPhase]:
    """
    Create fertilizer application schedule based on crop and NPK analysis
    """
    try:
        recommended_npk = npk_analysis.recommended_npk
        total_n = recommended_npk["N"]
        total_p = recommended_npk["P"] 
        total_k = recommended_npk["K"]
        
        phases = []
        
        # Phase 1: Pre-planting (Base fertilizer)
        base_n = total_n * 0.3
        base_p = total_p * 0.8  # Most P applied at base
        base_k = total_k * 0.5
        
        phases.append(ApplicationPhase(
            phase="Pre-planting",
            timing="1-2 weeks before planting",
            npk_ratio=f"{base_n:.0f}-{base_p:.0f}-{base_k:.0f}",
            quantity_per_hectare=calculate_fertilizer_quantity(base_n, base_p, base_k),
            application_method="Broadcast and incorporate into soil",
            notes="Apply during final land preparation"
        ))
        
        # Phase 2: Vegetative growth
        veg_n = total_n * 0.4
        veg_p = total_p * 0.1
        veg_k = total_k * 0.3
        
        phases.append(ApplicationPhase(
            phase="Vegetative Growth", 
            timing="3-4 weeks after planting",
            npk_ratio=f"{veg_n:.0f}-{veg_p:.0f}-{veg_k:.0f}",
            quantity_per_hectare=calculate_fertilizer_quantity(veg_n, veg_p, veg_k),
            application_method="Side-dress application",
            notes="Apply when plants are actively growing"
        ))
        
        # Phase 3: Reproductive stage
        repro_n = total_n * 0.3
        repro_p = total_p * 0.1
        repro_k = total_k * 0.2
        
        phases.append(ApplicationPhase(
            phase="Reproductive/Flowering",
            timing="During flowering/fruit development",
            npk_ratio=f"{repro_n:.0f}-{repro_p:.0f}-{repro_k:.0f}",
            quantity_per_hectare=calculate_fertilizer_quantity(repro_n, repro_p, repro_k),
            application_method="Foliar spray or fertigation",
            notes="Support fruit/grain development"
        ))
        
        return phases
        
    except Exception as e:
        raise Exception(f"Schedule creation failed: {str(e)}")

def calculate_fertilizer_quantity(n: float, p: float, k: float) -> float:
    """
    Calculate total fertilizer quantity needed based on NPK requirements
    Assumes average NPK fertilizer concentration
    """
    # Typical NPK fertilizer has about 15-20% of each nutrient
    # So if we need 50kg N, we need 50/0.15 = 333kg of 15% N fertilizer
    avg_concentration = 0.15  # 15% average
    total_nutrients = n + p + k
    return total_nutrients / avg_concentration

async def match_marketplace_products(
    npk_analysis: NPKAnalysis,
    organic_preference: OrganicPreference,
    db: Session
) -> List[MarketplaceMatch]:
    """
    Match fertilizer requirements with marketplace products
    """
    try:
        # Get fertilizer products from marketplace
        fertilizer_products = db.query(ProductModel).filter(
            ProductModel.category == "Fertilizers"
        ).all()
        
        matches = []
        recommended_npk = npk_analysis.recommended_npk
        
        for product in fertilizer_products:
            # Extract NPK ratio from product name/description
            npk_ratio = extract_npk_from_product(product)
            
            if npk_ratio:
                match_score = calculate_npk_match_score(recommended_npk, npk_ratio)
                
                # Filter by organic preference
                is_organic = "organic" in product.name.lower() or "organic" in product.description.lower()
                
                preference_match = True
                if organic_preference == OrganicPreference.ORGANIC and not is_organic:
                    preference_match = False
                elif organic_preference == OrganicPreference.CHEMICAL and is_organic:
                    preference_match = False
                
                if preference_match and match_score > 60:  # Only include good matches
                    quantity_needed = calculate_product_quantity_needed(recommended_npk, npk_ratio)
                    
                    matches.append(MarketplaceMatch(
                        product_id=product.id,
                        product_name=product.name,
                        npk_ratio=format_npk_ratio(npk_ratio),
                        price=float(product.price),
                        quantity_needed=quantity_needed,
                        total_cost=float(product.price) * quantity_needed,
                        match_score=match_score,
                        category=product.category,
                        organic_certified=is_organic
                    ))
        
        # Sort by match score (highest first)
        matches.sort(key=lambda x: x.match_score, reverse=True)
        
        return matches[:10]  # Return top 10 matches
        
    except Exception as e:
        raise Exception(f"Product matching failed: {str(e)}")

def extract_npk_from_product(product: ProductModel) -> Dict[str, float]:
    """
    Extract NPK values from product name/description
    """
    import re
    
    text = f"{product.name} {product.description}".lower()
    
    # Look for patterns like "10-10-10", "NPK 15-15-15", etc.
    npk_pattern = r'(?:npk\s*)?(\d+)[-\s]*(\d+)[-\s]*(\d+)'
    match = re.search(npk_pattern, text)
    
    if match:
        return {
            "N": float(match.group(1)),
            "P": float(match.group(2)), 
            "K": float(match.group(3))
        }
    
    # Default NPK for generic fertilizers
    if "nitrogen" in text or "urea" in text:
        return {"N": 45, "P": 0, "K": 0}
    elif "phosphorus" in text or "phosphate" in text:
        return {"N": 0, "P": 20, "K": 0}
    elif "potassium" in text or "potash" in text:
        return {"N": 0, "P": 0, "K": 50}
    else:
        return {"N": 10, "P": 10, "K": 10}  # Default balanced

def calculate_npk_match_score(recommended: Dict[str, float], product_npk: Dict[str, float]) -> float:
    """
    Calculate how well a product matches NPK requirements (0-100 score)
    """
    total_recommended = sum(recommended.values())
    if total_recommended == 0:
        return 0
    
    score = 0
    for nutrient in ["N", "P", "K"]:
        rec_ratio = recommended[nutrient] / total_recommended
        prod_ratio = product_npk[nutrient] / sum(product_npk.values()) if sum(product_npk.values()) > 0 else 0
        
        # Calculate difference (lower is better)
        diff = abs(rec_ratio - prod_ratio)
        nutrient_score = max(0, 100 - (diff * 200))  # Convert to 0-100 scale
        score += nutrient_score
    
    return score / 3  # Average of all three nutrients

def calculate_product_quantity_needed(recommended_npk: Dict[str, float], product_npk: Dict[str, float]) -> float:
    """
    Calculate quantity of product needed to meet NPK requirements
    """
    # Find the limiting nutrient (highest requirement ratio)
    ratios = []
    for nutrient in ["N", "P", "K"]:
        if product_npk[nutrient] > 0:
            ratio = recommended_npk[nutrient] / product_npk[nutrient]
            ratios.append(ratio)
    
    if ratios:
        return max(ratios) * 10  # Convert to kg, assume 10kg base unit
    else:
        return 25  # Default 25kg

def format_npk_ratio(npk: Dict[str, float]) -> str:
    """Format NPK values as ratio string"""
    return f"{npk['N']:.0f}-{npk['P']:.0f}-{npk['K']:.0f}"

async def analyze_soil_data(soil_data: SoilTestRequest) -> Dict[str, Any]:
    """
    Comprehensive soil data analysis combining multiple factors
    """
    try:
        # Get NPK analysis
        npk_analysis = await generate_npk_recommendation(soil_data)
        
        # Analyze soil health factors
        soil_health = {}
        
        # pH Analysis
        if soil_data.ph < 6.0:
            soil_health["ph_status"] = "Acidic - may limit nutrient availability"
            soil_health["ph_recommendation"] = "Consider lime application to raise pH"
        elif soil_data.ph > 8.0:
            soil_health["ph_status"] = "Alkaline - may cause nutrient lockup"
            soil_health["ph_recommendation"] = "Consider sulfur application to lower pH"
        else:
            soil_health["ph_status"] = "Optimal range for most crops"
            soil_health["ph_recommendation"] = "Maintain current pH levels"
        
        # Moisture Analysis
        if soil_data.moisture < 20:
            soil_health["moisture_status"] = "Low moisture - may affect nutrient uptake"
            soil_health["irrigation_need"] = "Increase irrigation frequency"
        elif soil_data.moisture > 80:
            soil_health["moisture_status"] = "High moisture - risk of waterlogging"
            soil_health["irrigation_need"] = "Improve drainage"
        else:
            soil_health["moisture_status"] = "Adequate moisture levels"
            soil_health["irrigation_need"] = "Maintain current irrigation schedule"
        
        # Organic matter assessment
        if soil_data.organic_matter and soil_data.organic_matter < 2.0:
            soil_health["organic_matter_status"] = "Low organic matter"
            soil_health["organic_matter_recommendation"] = "Add compost or organic amendments"
        elif soil_data.organic_matter and soil_data.organic_matter > 5.0:
            soil_health["organic_matter_status"] = "High organic matter - excellent"
            soil_health["organic_matter_recommendation"] = "Maintain current practices"
        else:
            soil_health["organic_matter_status"] = "Adequate organic matter"
            soil_health["organic_matter_recommendation"] = "Continue organic inputs"
        
        # Overall soil score
        score_factors = []
        
        # pH score (0-30 points)
        if 6.0 <= soil_data.ph <= 7.5:
            score_factors.append(30)
        elif 5.5 <= soil_data.ph <= 8.0:
            score_factors.append(20)
        else:
            score_factors.append(10)
        
        # Moisture score (0-25 points)
        if 30 <= soil_data.moisture <= 70:
            score_factors.append(25)
        elif 20 <= soil_data.moisture <= 80:
            score_factors.append(15)
        else:
            score_factors.append(5)
        
        # NPK adequacy score (0-45 points)
        adequate_nutrients = 0
        crop_req = CROP_NPK_REQUIREMENTS.get(soil_data.crop_type.value, CROP_NPK_REQUIREMENTS["other"])
        
        for nutrient in ["N", "P", "K"]:
            current = getattr(soil_data, nutrient.lower())
            min_req = crop_req[nutrient]["min"]
            max_req = crop_req[nutrient]["max"]
            if min_req <= current <= max_req:
                adequate_nutrients += 1
        
        score_factors.append(adequate_nutrients * 15)  # 15 points per adequate nutrient
        
        soil_health["overall_score"] = sum(score_factors)
        soil_health["score_interpretation"] = get_score_interpretation(soil_health["overall_score"])
        
        return {
            "npk_analysis": npk_analysis,
            "soil_health": soil_health,
            "recommendations_summary": create_recommendations_summary(npk_analysis, soil_health, soil_data)
        }
        
    except Exception as e:
        raise Exception(f"Soil analysis failed: {str(e)}")

def get_score_interpretation(score: int) -> str:
    """Interpret soil health score"""
    if score >= 80:
        return "Excellent soil health - optimal for crop production"
    elif score >= 60:
        return "Good soil health - minor improvements recommended"
    elif score >= 40:
        return "Fair soil health - several improvements needed"
    else:
        return "Poor soil health - significant amendments required"

def create_recommendations_summary(npk_analysis: NPKAnalysis, soil_health: Dict, soil_data: SoilTestRequest) -> List[str]:
    """Create a summary of key recommendations"""
    recommendations = []
    
    # NPK recommendations
    for nutrient, amount in npk_analysis.recommended_npk.items():
        if amount > 0:
            recommendations.append(f"Apply {amount:.0f} kg/ha of {nutrient}")
    
    # pH corrections
    if "lime application" in soil_health.get("ph_recommendation", ""):
        recommendations.append("Apply lime to correct soil acidity")
    elif "sulfur application" in soil_health.get("ph_recommendation", ""):
        recommendations.append("Apply sulfur to reduce soil alkalinity")
    
    # Organic matter
    if soil_data.organic_matter and soil_data.organic_matter < 2.0:
        recommendations.append("Increase organic matter with compost or manure")
    
    # Moisture management
    if "drainage" in soil_health.get("irrigation_need", ""):
        recommendations.append("Improve field drainage to prevent waterlogging")
    elif "irrigation" in soil_health.get("irrigation_need", ""):
        recommendations.append("Increase irrigation frequency for better moisture")
    
    return recommendations
