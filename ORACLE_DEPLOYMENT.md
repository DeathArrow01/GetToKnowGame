# Deploy Get to Know Game on Oracle Cloud AMD VM (Free Forever)

This guide will help you deploy the Get to Know Game application on Oracle Cloud's Always-Free AMD VM with automatic SSL certificates and domain support.

## 🎯 Overview

- **Cost**: $0/month (Oracle Always-Free) + ~$1/year domain
- **Stack**: SvelteKit + Go + MongoDB Atlas + Nginx + Let's Encrypt
- **Deployment**: `git push` → live in 2-3 minutes
- **SSL**: Automatic renewal with Let's Encrypt
- **Domain**: Custom domain support

## 📋 Prerequisites

1. **Oracle Cloud Account** (free at [cloud.oracle.com](https://cloud.oracle.com))
2. **Domain Name** (optional, ~$1/year from [porkbun.com](https://porkbun.com))
3. **MongoDB Atlas Account** (free tier)
4. **GitHub Account** (for automated deployment)

## 🚀 Step-by-Step Deployment

### 1. Create Oracle Cloud AMD VM

1. **Go to Oracle Cloud Console**
   - Visit [cloud.oracle.com](https://cloud.oracle.com)
   - Sign in or create free account

2. **Create Compute Instance**
   - Navigate to **Compute** → **Instances** → **Create Instance**
   - **Name**: `get-to-know-game-server`
   - **Image**: Ubuntu 22.04 LTS
   - **Shape**: VM.Standard.E2.1.Micro (AMD) - "Always Free eligible"
   - **Boot Volume**: 50 GB (free tier limit)
   - **SSH Keys**: Add your public SSH key (see step 2)

3. **Configure Security Rules**
   - **Ingress Rules**:
     - SSH (22) - Source: 0.0.0.0/0
     - HTTP (80) - Source: 0.0.0.0/0  
     - HTTPS (443) - Source: 0.0.0.0/0

4. **Note the Public IP**
   - Copy the public IP address (e.g., `123.45.67.89`)

### 2. Generate SSH Key (if you don't have one)

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "oracle-vm-deploy" -f ~/.ssh/oracle_vm

# Display public key to add to Oracle VM
cat ~/.ssh/oracle_vm.pub
```

Copy the output and paste it in the Oracle Console when creating the VM.

### 3. Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free account

2. **Create Cluster**
   - Choose **M0 Sandbox** (free tier)
   - Select region close to your Oracle VM
   - Create cluster

3. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Username: `admin` (or your choice)
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to **Network Access** → **Add IP Address**
   - Add `0.0.0.0/0` (allows all IPs) for testing
   - For production, add your Oracle VM IP: `123.45.67.89/32`

5. **Get Connection String**
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy connection string
   - Replace `<password>` with your actual password
   - Add database name: `/GetToKnowGame?retryWrites=true&w=majority`
   - Final format: `mongodb+srv://admin:YOUR_PASSWORD@cluster0.mongodb.net/GetToKnowGame?retryWrites=true&w=majority`

### 4. Set Up Domain (Optional but Recommended)

1. **Buy Domain**
   - Go to [porkbun.com](https://porkbun.com) or any domain registrar
   - Buy `.xyz` domain for ~$1/year
   - Example: `mygame.xyz`

2. **Configure DNS**
   - Set A record: `@` → `123.45.67.89` (your Oracle VM IP)
   - Set A record: `api` → `123.45.67.89` (same IP for API subdomain)

### 5. Configure GitHub Secrets

1. **Go to Your GitHub Repository**
   - Navigate to **Settings** → **Secrets and variables** → **Actions**

2. **Add Required Secrets**:
   ```
   ORACLE_VM_IP → 123.45.67.89
   SSH_PRIVATE_KEY → (content of ~/.ssh/oracle_vm file)
   MONGODB_URI → mongodb+srv://admin:password@cluster0.mongodb.net/GetToKnowGame?retryWrites=true&w=majority
   DOMAIN_NAME → mygame.xyz
   LETSENCRYPT_EMAIL → your-email@example.com
   ```

### 6. Initial VM Setup (One-time)

```bash
# Connect to your VM
ssh -i ~/.ssh/oracle_vm ubuntu@123.45.67.89

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again to activate Docker
exit
ssh -i ~/.ssh/oracle_vm ubuntu@123.45.67.89

# Verify Docker installation
docker --version
docker-compose --version
```

### 7. Deploy Application

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Oracle Cloud"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to your GitHub repository
   - Click **Actions** tab
   - Watch the deployment progress
   - Should complete in 2-3 minutes

3. **Access Your Application**
   - Frontend: `https://mygame.xyz`
   - API: `https://api.mygame.xyz`
   - Health check: `https://api.mygame.xyz/health`

## 🔧 Configuration Files

### Environment Variables
The deployment uses these environment variables:

```bash
DOMAIN_NAME=mygame.xyz
MONGODB_URI=mongodb+srv://admin:password@cluster0.mongodb.net/GetToKnowGame?retryWrites=true&w=majority
LETSENCRYPT_EMAIL=your-email@example.com
```

### Docker Compose Services
- **frontend**: SvelteKit application (port 3000)
- **backend**: Go API server (port 8080)
- **nginx**: Reverse proxy with SSL (ports 80, 443)
- **certbot**: Automatic SSL certificate renewal

## 🔒 Security Features

- **SSL/TLS**: Automatic Let's Encrypt certificates
- **Rate Limiting**: API rate limiting (10 req/s)
- **Security Headers**: HSTS, XSS protection, etc.
- **Non-root Users**: Containers run as non-root users
- **CORS**: Properly configured for frontend-backend communication

## 📊 Monitoring & Maintenance

### Health Checks
- Frontend: `https://mygame.xyz`
- Backend: `https://api.mygame.xyz/health`

### Logs
```bash
# View application logs
ssh -i ~/.ssh/oracle_vm ubuntu@123.45.67.89
cd /home/ubuntu/get-to-know-game
docker-compose -f oracle-deploy/docker-compose.yml logs -f

# View specific service logs
docker-compose -f oracle-deploy/docker-compose.yml logs -f frontend
docker-compose -f oracle-deploy/docker-compose.yml logs -f backend
docker-compose -f oracle-deploy/docker-compose.yml logs -f nginx
```

### SSL Certificate Renewal
- Certificates automatically renew every 12 hours
- No manual intervention required
- Certificates valid for 90 days

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Generation Fails**
   ```bash
   # Check if domain DNS is pointing to your VM
   nslookup mygame.xyz
   
   # Manually generate certificates
   ssh -i ~/.ssh/oracle_vm ubuntu@123.45.67.89
   cd /home/ubuntu/get-to-know-game
   docker-compose -f oracle-deploy/docker-compose.yml exec certbot certbot certonly --webroot --webroot-path=/var/www/certbot -d mygame.xyz -d api.mygame.xyz --email your-email@example.com --agree-tos --no-eff-email
   ```

2. **MongoDB Connection Issues**
   - Verify MongoDB Atlas network access includes your VM IP
   - Check connection string format
   - Ensure database user has correct permissions

3. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify all secrets are set correctly
   - Ensure VM has enough resources (1GB RAM should be sufficient)

4. **Application Not Loading**
   ```bash
   # Check container status
   docker-compose -f oracle-deploy/docker-compose.yml ps
   
   # Restart services
   docker-compose -f oracle-deploy/docker-compose.yml restart
   ```

### Performance Optimization

1. **Resource Monitoring**
   ```bash
   # Check system resources
   htop
   
   # Check Docker resource usage
   docker stats
   ```

2. **Database Optimization**
   - Use MongoDB Atlas M2+ for better performance
   - Add database indexes for frequently queried fields
   - Monitor Atlas metrics

## 💰 Cost Breakdown

- **Oracle Cloud VM**: $0/month (Always-Free tier)
- **Domain**: ~$1/year
- **MongoDB Atlas**: $0/month (M0 free tier)
- **Total**: ~$1/year

## 🔄 Updates & Maintenance

### Automatic Updates
- Push to `main` branch triggers automatic deployment
- Zero-downtime deployments with Docker Compose
- Automatic SSL certificate renewal

### Manual Updates
```bash
# SSH into VM
ssh -i ~/.ssh/oracle_vm ubuntu@123.45.67.89

# Navigate to app directory
cd /home/ubuntu/get-to-know-game

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f oracle-deploy/docker-compose.yml up -d --build
```

## 🎉 Success!

Your Get to Know Game is now live at:
- **Frontend**: `https://mygame.xyz`
- **API**: `https://api.mygame.xyz`
- **Health Check**: `https://api.mygame.xyz/health`

The application will automatically:
- ✅ Handle SSL certificates
- ✅ Renew certificates before expiration
- ✅ Deploy updates on `git push`
- ✅ Restart on VM reboot
- ✅ Scale within free tier limits

## 📚 Additional Resources

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check application logs on the VM
4. Verify all configuration steps were completed

Your app is now running on a free, production-ready infrastructure! 🚀
