#!/bin/bash

echo "🐳 Testing Docker setup for Render deployment..."

# Test if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test building the Go backend
echo "🔨 Building Go backend..."
cd backend/get-to-know-game-go
if docker build -t get-to-know-backend .; then
    echo "✅ Go backend build successful"
else
    echo "❌ Go backend build failed"
    exit 1
fi

# Test building the frontend
echo "🔨 Building frontend..."
cd ../../frontend/get-to-know-game
if docker build -t get-to-know-frontend .; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test docker-compose
echo "🔨 Testing docker-compose..."
cd ../..
if docker-compose config > /dev/null; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration is invalid"
    exit 1
fi

echo ""
echo "🎉 All Docker tests passed! Your app is ready for Render deployment."
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to render.com and create a new Blueprint"
echo "3. Deploy from your GitHub repository"
echo "4. Set the environment variables as described in RENDER_DEPLOYMENT.md"
