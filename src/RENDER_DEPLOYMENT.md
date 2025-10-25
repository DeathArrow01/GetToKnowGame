# Render Deployment Guide

This guide will help you deploy the Get to Know Game application to Render using Docker and MongoDB Atlas.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
4. **Docker Setup**: All Docker files are already configured

## Deployment Steps

### 1. Prepare Your Repository

Make sure all files are committed to your repository:

```bash
git add .
git commit -m "Add Render deployment support"
git push origin main
```

### 2. Set Up MongoDB Atlas (Recommended)

#### Step 2.1: Create MongoDB Atlas Account
1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Sign up** for a free account
3. **Create a new project** (e.g., "GetToKnowGame")

#### Step 2.2: Create a Cluster
1. **Click "Build a Database"**
2. **Choose "M0 Sandbox"** (Free tier)
3. **Select Provider**: AWS
4. **Select Region**: US East (N. Virginia) - `us-east-1`
5. **Cluster Name**: `GetToKnowApp` (or any name you prefer)
6. **Click "Create Cluster"**

#### Step 2.3: Create Database User
1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `admin` (or your preferred username)
5. **Password**: Generate a secure password (save it!)
6. **Database User Privileges**: "Read and write to any database"
7. **Click "Add User"**

#### Step 2.4: Configure Network Access
1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **For testing**: Add `0.0.0.0/0` (allows all IPs)
4. **For production**: Add Render's specific IP addresses:
   - `44.229.227.142`
   - `54.188.71.94`
   - `52.13.128.108`
   - `74.220.48.0/24`
   - `74.220.56.0/24`
5. **Click "Confirm"**

#### Step 2.5: Get Connection String
1. **Go to "Database"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Driver**: Go
5. **Version**: 1.17 or later
6. **Copy the connection string** (it will look like):
   ```
   mongodb+srv://admin:<password>@gettoknowapp.pv3i7si.mongodb.net/?appName=GetToKnowApp
   ```
7. **Replace `<password>`** with your actual password
8. **Add database name**: `/GetToKnowGame?retryWrites=true&w=majority`
9. **Final connection string**:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@gettoknowapp.pv3i7si.mongodb.net/GetToKnowGame?appName=GetToKnowApp&retryWrites=true&w=majority
   ```

### 3. Deploy on Render

#### Option A: Using Render Blueprint (Recommended)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Services**
   - Render will detect the `render.yaml` file
   - It will automatically create services for:
     - Go Backend API
     - SvelteKit Frontend
   - **Note**: MongoDB is handled by Atlas (not included in Blueprint)

4. **Deploy**
   - Click "Apply" to deploy all services
   - Render will build and deploy everything automatically

#### Option B: Manual Service Creation

1. **Create Backend Service**
   - New + → "Web Service"
   - Connect GitHub repo
   - Root Directory: `src/backend/get-to-know-game-go`
   - Build Command: `docker build -t backend .`
   - Start Command: `./main`

2. **Create Frontend Service**
   - New + → "Web Service"
   - Connect GitHub repo
   - Root Directory: `src/frontend/get-to-know-game`
   - Build Command: `npm run build`
   - Start Command: `node build`

### 4. Environment Variables

**⚠️ IMPORTANT: Set these environment variables in Render dashboard, NOT in the code!**

#### For Backend Service:
```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@gettoknowapp.pv3i7si.mongodb.net/GetToKnowGame?appName=GetToKnowApp&retryWrites=true&w=majority
PORT=5012
FIBER_ENV=production
```

#### For Frontend Service:
```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://admin:***@cluster.mongodb.net/GetToKnowGame?appName=GetToKnowApp&retryWrites=true&w=majority` |
| `PORT` | Backend server port | `5012` |
| `FIBER_ENV` | Go Fiber environment | `production` |
| `VITE_API_URL` | Frontend API URL | `https://your-app.onrender.com/api` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `RENDER_EXTERNAL_URL` | Render external URL | Auto-generated |

## MongoDB Atlas Troubleshooting

### Common Connection Issues

1. **"bad auth : authentication failed"**
   - **Solution**: Verify username and password in Atlas
   - **Check**: Database Access → User credentials
   - **Fix**: Reset password if needed

2. **"no such host" or "context deadline exceeded"**
   - **Solution**: Check Network Access settings
   - **Check**: Network Access → IP whitelist
   - **Fix**: Add Render IP addresses or `0.0.0.0/0` for testing

3. **"remote error: tls: internal error"**
   - **Solution**: This is usually an IP whitelist issue
   - **Check**: Network Access → IP whitelist
   - **Fix**: Ensure Render IPs are whitelisted

4. **"connection pool cleared"**
   - **Solution**: Check connection string format
   - **Check**: Ensure proper URI encoding
   - **Fix**: Use the exact format from Atlas

### Testing MongoDB Connection

1. **Test locally first**:
   ```bash
   # Install MongoDB Shell
   npm install -g mongosh
   
   # Test connection
   mongosh "mongodb+srv://admin:YOUR_PASSWORD@gettoknowapp.pv3i7si.mongodb.net/GetToKnowGame?appName=GetToKnowApp"
   ```

2. **Test in MongoDB Compass**:
   - Download [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Use the same connection string
   - Verify connection works

## Monitoring and Logs

### View Logs
- Go to your Render service dashboard
- Click on any service to view logs
- Use the log viewer to debug issues

### Health Checks
- Backend health check: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.onrender.com/` (port 80)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all Docker files are present
   - Verify environment variables

2. **CORS Errors**
   - Update CORS settings in Go backend
   - Ensure frontend URL is correct in environment variables

3. **Database Connection Issues**
   - Verify MongoDB Atlas URI format
   - Check if MongoDB Atlas cluster is running
   - Ensure credentials are correct
   - Verify Network Access settings

4. **Frontend Not Loading**
   - Check if build process completed successfully
   - Verify environment variables
   - Check frontend service logs

### Debug Commands

```bash
# Check service status
render service list

# View logs
render logs --service your-service-name

# Check environment variables
render env list --service your-service-name
```

## Scaling

### Free Tier Limits
- **Render Free Tier**: 750 hours/month per service, 512MB RAM
- **MongoDB Atlas Free Tier**: 512MB storage, shared clusters
- **Services sleep** after 15 minutes of inactivity
- **Wake up** when accessed (perfect for your game!)

### Upgrading
- **Render**: Upgrade to paid plans for always-on services
- **MongoDB Atlas**: Upgrade to M2/M5 for dedicated clusters
- More RAM and CPU resources
- Custom domains and SSL

## Security

### 🔒 **CRITICAL: Environment Variables**
- **NEVER commit credentials to Git**
- **Set all sensitive data in Render dashboard only**
- Use strong, unique passwords
- Rotate passwords regularly
- Use Render's secure environment variable system

### 🔐 **Setting Environment Variables in Render:**
1. Go to your service in Render dashboard
2. Click on "Environment" tab
3. Add each variable with secure values:
   - `MONGODB_URI`: Full Atlas connection string with your credentials
   - `VITE_API_URL`: Your backend service URL

### 🌐 **HTTPS**
- Render provides free SSL certificates
- All traffic is automatically encrypted
- Production URLs use HTTPS by default

### 🛡️ **MongoDB Atlas Security**
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Whitelist only necessary IP addresses
- Enable MongoDB Atlas monitoring
- Set up database user with minimal required permissions

## Cost Optimization

### Free Tier Usage
- Your app fits perfectly in the free tier
- Services sleep when not in use
- Wake up instantly when accessed
- Perfect for a game application

### Monitoring Usage
- Check usage in Render dashboard
- Monitor MongoDB Atlas usage
- Monitor service uptime
- Optimize resource usage

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Community Discord**: [Render Discord](https://discord.gg/render)
- **GitHub Issues**: Create issues in your repository

## Next Steps

After successful deployment:

1. **Test the Application**
   - Verify all endpoints work
   - Test the complete game flow
   - Check mobile responsiveness

2. **Set Up Monitoring**
   - Configure uptime monitoring
   - Set up error tracking
   - Monitor performance metrics

3. **Backup Strategy**
   - Set up MongoDB Atlas automated backups
   - Configure point-in-time recovery
   - Test restore procedures

4. **CI/CD Pipeline**
   - Set up automatic deployments
   - Configure staging environment
   - Implement testing pipeline

5. **Security Hardening**
   - Replace `0.0.0.0/0` with specific IP addresses
   - Set up MongoDB Atlas monitoring
   - Configure alerting for security events

## Quick Reference

### MongoDB Atlas Connection String Format
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?appName=APP_NAME&retryWrites=true&w=majority
```

### Render Service URLs
- **Backend**: `https://your-backend-service.onrender.com`
- **Frontend**: `https://your-frontend-service.onrender.com`
- **Health Check**: `https://your-backend-service.onrender.com/health`

### Environment Variables Checklist
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `PORT` - Backend port (5012)
- [ ] `FIBER_ENV` - Production environment
- [ ] `VITE_API_URL` - Frontend API URL