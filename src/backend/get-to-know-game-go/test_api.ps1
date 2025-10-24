# Test script for Go backend API
$BaseUrl = "http://localhost:5012"

Write-Host "Testing Go Backend API..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Test health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
    $healthResponse | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test questions endpoint
Write-Host "2. Testing questions endpoint..." -ForegroundColor Yellow
try {
    $questionsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/questions" -Method Get
    $questionsResponse | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test creating a session
Write-Host "3. Testing session creation..." -ForegroundColor Yellow
try {
    $sessionBody = @{
        player1Name = "Alice"
        player2Name = "Bob"
    } | ConvertTo-Json

    $sessionResponse = Invoke-RestMethod -Uri "$BaseUrl/api/sessions" -Method Post -Body $sessionBody -ContentType "application/json"
    $sessionResponse | ConvertTo-Json

    $sessionId = $sessionResponse.sessionId
    Write-Host "Session ID: $sessionId" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test getting session
Write-Host "4. Testing get session..." -ForegroundColor Yellow
try {
    $getSessionResponse = Invoke-RestMethod -Uri "$BaseUrl/api/sessions/$sessionId" -Method Get
    $getSessionResponse | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "API tests completed!" -ForegroundColor Green
