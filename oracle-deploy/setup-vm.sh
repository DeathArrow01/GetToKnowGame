#!/bin/bash

# Oracle Cloud AMD VM Setup Script for Get to Know Game
# Run this script once after creating your Oracle VM

set -e

echo "🚀 Setting up Oracle Cloud AMD VM for Get to Know Game..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y docker.io docker-compose

# Add user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Install additional useful tools
echo "🛠️ Installing additional tools..."
sudo apt install -y curl wget git htop

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/get-to-know-game
cd /home/ubuntu/get-to-know-game

# Create certbot directories
echo "🔒 Creating SSL certificate directories..."
mkdir -p certbot/conf certbot/www

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/get-to-know-game
chmod 755 /home/ubuntu/get-to-know-game

# Configure Docker to start on boot
echo "⚙️ Configuring Docker to start on boot..."
sudo systemctl enable docker
sudo systemctl start docker

# Create a simple health check script
echo "🏥 Creating health check script..."
cat > /home/ubuntu/health-check.sh << 'EOF'
#!/bin/bash
echo "=== System Health Check ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h)"
echo "Disk: $(df -h /)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "=========================="
EOF

chmod +x /home/ubuntu/health-check.sh

# Create a deployment status script
echo "📊 Creating deployment status script..."
cat > /home/ubuntu/deployment-status.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/get-to-know-game
if [ -f "oracle-deploy/docker-compose.yml" ]; then
    echo "=== Deployment Status ==="
    docker-compose -f oracle-deploy/docker-compose.yml ps
    echo "========================="
else
    echo "Application not deployed yet. Run the GitHub Actions workflow to deploy."
fi
EOF

chmod +x /home/ubuntu/deployment-status.sh

# Create a backup script
echo "💾 Creating backup script..."
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating backup: backup_$DATE.tar.gz"
cd /home/ubuntu
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz get-to-know-game/ --exclude='get-to-know-game/certbot/conf' --exclude='get-to-know-game/node_modules'

# Keep only last 5 backups
cd $BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +6 | xargs -r rm

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"
EOF

chmod +x /home/ubuntu/backup.sh

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
fi

# Set up log rotation for Docker
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-containers > /dev/null << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Create a systemd service for automatic startup (optional)
echo "🔄 Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/get-to-know-game.service > /dev/null << 'EOF'
[Unit]
Description=Get to Know Game Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/get-to-know-game
ExecStart=/usr/bin/docker-compose -f oracle-deploy/docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f oracle-deploy/docker-compose.yml down
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable the service (but don't start it yet)
sudo systemctl enable get-to-know-game.service

echo ""
echo "✅ VM setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Logout and login again to activate Docker group membership"
echo "2. Set up your GitHub repository secrets"
echo "3. Push your code to trigger the deployment"
echo ""
echo "🔧 Useful commands:"
echo "  - Check system health: ./health-check.sh"
echo "  - Check deployment status: ./deployment-status.sh"
echo "  - Create backup: ./backup.sh"
echo "  - View logs: cd get-to-know-game && docker-compose -f oracle-deploy/docker-compose.yml logs -f"
echo ""
echo "🌐 Your VM is ready for deployment!"
echo "   Public IP: $(curl -s ifconfig.me)"
echo ""
echo "⚠️  Please logout and login again to activate Docker group membership:"
echo "   exit"
echo "   ssh -i ~/.ssh/oracle_vm ubuntu@$(curl -s ifconfig.me)"
