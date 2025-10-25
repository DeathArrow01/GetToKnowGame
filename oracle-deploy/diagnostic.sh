#!/bin/bash

echo "🔍 MongoDB Environment Diagnostic Script"
echo "========================================"

# Navigate to app directory
cd /home/ubuntu/get-to-know-game

echo ""
echo "📁 Checking environment files..."
echo "================================"
echo "Root .env file exists: $(ls -la .env 2>/dev/null && echo "YES" || echo "NO")"
echo "Oracle-deploy .env file exists: $(ls -la oracle-deploy/.env 2>/dev/null && echo "YES" || echo "NO")"

echo ""
echo "📄 Environment file contents:"
echo "============================="
echo "--- Root .env file ---"
cat .env 2>/dev/null || echo "File not found or empty"

echo ""
echo "--- Oracle-deploy .env file ---"
cat oracle-deploy/.env 2>/dev/null || echo "File not found or empty"

echo ""
echo "🐳 Container status:"
echo "==================="
cd oracle-deploy
docker-compose ps

echo ""
echo "🔧 Backend container environment variables:"
echo "==========================================="
docker-compose exec backend env | grep MONGODB || echo "MONGODB_URI not found in container"

echo ""
echo "📋 All environment variables in backend container:"
echo "=================================================="
docker-compose exec backend env | head -20
echo "... (showing first 20 variables)"

echo ""
echo "📝 Backend logs (last 30 lines):"
echo "================================"
docker-compose logs --tail=30 backend

echo ""
echo "🌐 MongoDB connection test:"
echo "=========================="
# Test MongoDB connection if mongosh is available
if command -v mongosh &> /dev/null; then
    source .env
    echo "Testing connection to: $MONGODB_URI"
    mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" 2>&1 || echo "Connection test failed"
else
    echo "mongosh not installed, skipping connection test"
fi

echo ""
echo "🔍 Docker Compose configuration:"
echo "================================"
docker-compose config backend | grep -A 10 -B 5 environment

echo ""
echo "✅ Diagnostic complete!"
