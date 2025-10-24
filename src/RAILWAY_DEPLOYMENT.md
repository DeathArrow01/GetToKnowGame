# Railway Deployment Guide

This guide will help you deploy the Get to Know Game application to Railway using Docker.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Railway CLI** (optional): Install for local management

## Deployment Steps

### 1. Prepare Your Repository

Make sure all Docker files are committed to your repository:

```bash
git add .
git commit -m "Add Docker support for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

#### Option A: Using Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Services**
   - Railway will detect the `docker-compose.railway.yml` file
   - It will automatically create services for:
     - MongoDB
     - Go Backend
     - Frontend (Nginx)

4. **Set Environment Variables**
   - Go to your project settings
   - Add these environment variables:
     ```
     MONGODB_URI=mongodb://***:***@mongodb:27017/GetToKnowGame?authSource=admin
     PORT=5012
     FIBER_ENV=production
     VITE_API_URL=https://your-app.railway.app/api
     MONGO_INITDB_ROOT_USERNAME=***
     MONGO_INITDB_ROOT_PASSWORD=***
     ```

#### Option B: Using Railway CLI

1. **Install Railway CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://railway.app/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -fsSL https://railway.app/install.sh | sh
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### 3. Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables**
   - Update `VITE_API_URL` to use your custom domain
   - Redeploy the application

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://***:***@mongodb:27017/GetToKnowGame?authSource=admin` |
| `PORT` | Backend server port | `5012` |
| `FIBER_ENV` | Go Fiber environment | `production` |
| `VITE_API_URL` | Frontend API URL | `https://your-app.railway.app/api` |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB admin username | `***` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB admin password | `***` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `RAILWAY_STATIC_URL` | Railway static URL | Auto-generated |

## Monitoring and Logs

### View Logs
- Go to your Railway project dashboard
- Click on any service to view logs
- Use the log viewer to debug issues

### Health Checks
- Backend health check: `https://your-app.railway.app/health`
- Frontend: `https://your-app.railway.app/`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker logs in Railway dashboard
   - Ensure all Docker files are present
   - Verify environment variables

2. **CORS Errors**
   - Update CORS settings in `main.go`
   - Ensure frontend URL is correct in environment variables

3. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check if MongoDB service is running
   - Ensure credentials are correct

4. **Frontend Not Loading**
   - Check if nginx configuration is correct
   - Verify build process completed successfully
   - Check frontend service logs

### Debug Commands

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service shell
railway shell

# Restart services
railway restart
```

## Scaling

### Horizontal Scaling
- Railway automatically handles load balancing
- Add more instances in the dashboard if needed

### Vertical Scaling
- Upgrade your Railway plan for more resources
- Configure resource limits in `railway.json`

## Security

### Environment Variables
- Never commit sensitive data to Git
- Use Railway's environment variable system
- Rotate passwords regularly

### HTTPS
- Railway provides free SSL certificates
- All traffic is automatically encrypted

## Cost Optimization

### Free Tier Limits
- Railway free tier includes:
  - $5 credit per month
  - 512MB RAM per service
  - 1GB disk space

### Monitoring Usage
- Check usage in Railway dashboard
- Set up billing alerts
- Optimize resource usage

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community Discord**: [Railway Discord](https://discord.gg/railway)
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
   - Set up MongoDB backups
   - Configure automated backups
   - Test restore procedures

4. **CI/CD Pipeline**
   - Set up automatic deployments
   - Configure staging environment
   - Implement testing pipeline
