# Test PDF download endpoint
$loginData = @{
    email = "demo@agriai.com"
    password = "demo123"
} | ConvertTo-Json

Write-Host "Logging in..." -ForegroundColor Green

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login successful" -ForegroundColor Green
    
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $reportData = @{
        soil_data = @{
            nitrogen = 50.0
            phosphorus = 30.0
            potassium = 40.0
            ph = 6.5
            moisture = 25.0
            organic_matter = 2.5
            crop_type = "wheat"
            field_size = 1.0
            location = "Demo Farm"
        }
        analysis = @{
            current_npk = @{ N = 50.0; P = 30.0; K = 40.0 }
            recommended_npk = @{ N = 60.0; P = 24.0; K = 9.0 }
            deficiency_analysis = @{
                N = "Deficient by 50.0 mg/kg. Requires supplementation."
                P = "Deficient by 20.0 mg/kg. Requires supplementation."
                K = "Within optimal range. Maintenance application recommended."
            }
            confidence_score = 95.0
        }
        schedule = @(
            @{
                phase = "pre-planting"
                timing = "1-2 weeks before planting"
                nitrogen_kg_per_ha = 50.0
                phosphorus_kg_per_ha = 25.0
                potassium_kg_per_ha = 15.0
                application_method = "Broadcast and incorporate"
            }
        )
        marketplace = @()
    } | ConvertTo-Json -Depth 10
    
    Write-Host "Testing PDF download..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/fertilizer/download-report" -Method POST -Body $reportData -Headers $headers
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "Content Type: $($response.Headers.'Content-Type')" -ForegroundColor Cyan
    Write-Host "Content Length: $($response.Headers.'Content-Length')" -ForegroundColor Cyan
    
    if ($response.StatusCode -eq 200) {
        $response.Content | Set-Content -Path "test_fertilizer_report.pdf" -Encoding Byte
        Write-Host "PDF download successful! File saved as test_fertilizer_report.pdf" -ForegroundColor Green
    } else {
        Write-Host "PDF download failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
