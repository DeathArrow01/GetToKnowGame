# Test Docker setup for Railway deployment

Write-Host "Testing Docker setup for Railway deployment..." -ForegroundColor Cyan

# Test if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Test building the Go backend
Write-Host "Building Go backend..." -ForegroundColor Yellow
Set-Location "backend/get-to-know-game-go"
try {
    docker build -t get-to-know-backend .
    Write-Host "Go backend build successful" -ForegroundColor Green
} catch {
    Write-Host "Go backend build failed" -ForegroundColor Red
    exit 1
}

# Test building the frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location "../../frontend/get-to-know-game"
try {
    docker build -t get-to-know-frontend .
    Write-Host "Frontend build successful" -ForegroundColor Green
} catch {
    Write-Host "Frontend build failed" -ForegroundColor Red
    exit 1
}

# Test docker-compose
Write-Host "Testing docker-compose..." -ForegroundColor Yellow
Set-Location "../.."
try {
    docker-compose -f docker-compose.railway.yml config | Out-Null
    Write-Host "Docker Compose configuration is valid" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose configuration is invalid" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All Docker tests passed! Your app is ready for Railway deployment." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub" -ForegroundColor White
Write-Host "2. Go to railway.app and create a new project" -ForegroundColor White
Write-Host "3. Deploy from your GitHub repository" -ForegroundColor White
Write-Host "4. Set the environment variables as described in RAILWAY_DEPLOYMENT.md" -ForegroundColor White