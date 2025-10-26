# Local Development Setup 🚀

This guide will help you set up the Get to Know Game for local development using Docker Compose.

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Node.js 18+** (for frontend development)
- **Git** (for cloning the repository)

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Run the automated startup script
./start-local.bat
```

**Linux/Mac:**
```bash
# Make script executable and run
chmod +x start-local.sh
./start-local.sh
```

### Option 2: Manual Setup

1. **Start MongoDB:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mongodb
   ```

2. **Start Backend:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d backend
   ```

3. **Start Frontend:**
   ```bash
   cd src/frontend/get-to-know-game
   npm install
   npm run dev
   ```

## Access Points

Once everything is running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5012
- **Admin Dashboard**: http://localhost:5173/admin
- **MongoDB**: localhost:27017

## Admin Access

To access the admin dashboard:

1. **Set up authentication** using a browser extension like ModHeader
2. **Add header**: `Authorization: Bearer my-secure-admin-key-2024`
3. **Navigate to**: http://localhost:5173/admin

## Development Commands

### Backend Development

```bash
# Run backend in development mode
cd src/backend/get-to-know-game-go
go run main.go

# Run tests
go test ./...

# Build for production
go build -o main .
```

### Frontend Development

```bash
# Install dependencies
cd src/frontend/get-to-know-game
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# Connect to MongoDB
docker exec -it get-to-know-mongodb-dev mongosh -u admin -p password

# View logs
docker-compose -f docker-compose.dev.yml logs mongodb

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d mongodb
```

## Docker Services

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Username**: admin
- **Password**: password
- **Database**: GetToKnowGame

### Backend (Go)
- **Port**: 5012
- **Environment**: Development
- **Hot Reload**: Enabled (with volume mounting)

### Frontend (SvelteKit)
- **Port**: 5173
- **Environment**: Development
- **Hot Reload**: Enabled

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :5012
   netstat -ano | findstr :5173
   
   # Kill the process
   taskkill /PID <PID> /F
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose -f docker-compose.dev.yml logs mongodb
   
   # Restart MongoDB
   docker-compose -f docker-compose.dev.yml restart mongodb
   ```

3. **Backend Build Issues**
   ```bash
   # Rebuild backend
   docker-compose -f docker-compose.dev.yml build --no-cache backend
   ```

4. **Frontend Dependencies**
   ```bash
   # Clear node_modules and reinstall
   cd src/frontend/get-to-know-game
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs

# View specific service logs
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs mongodb
```

### Cleanup

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose -f docker-compose.dev.yml down -v

# Remove all containers and images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Environment Variables

The following environment variables are configured for local development:

```bash
# Backend
MONGODB_URI=mongodb://admin:password@mongodb:27017/GetToKnowGame?authSource=admin
ADMIN_KEY=your-super-secret-admin-key-change-this
TRACKING_ENABLED=true
PORT=5012

# Frontend
VITE_API_URL=http://localhost:5012/api
```

## API Testing

### Test Backend Health
```bash
curl http://localhost:5012/api/questions
```

### Test Admin Endpoints
```bash
# Get admin stats (requires admin key in header)
curl -H "Authorization: Bearer my-secure-admin-key-2024" \
     http://localhost:5012/api/admin/stats
```

### Test Tracking
```bash
# Test tracking endpoint
curl -X POST http://localhost:5012/api/track \
     -H "Content-Type: application/json" \
     -d '{"playerId":"test","event":"page_view","url":"/","time":"2024-01-01T00:00:00Z"}'
```

## Production Build

To test the production build locally:

```bash
# Build and start all services
docker-compose up --build

# Access via nginx proxy
# Frontend: http://localhost
# Backend API: http://localhost/api
```

## Next Steps

1. **Test the application** by creating a game session
2. **Access the admin dashboard** to view analytics
3. **Add new questions** through the admin interface
4. **Test tracking** by playing the game and checking analytics

Happy coding! 🎮
