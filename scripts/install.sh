#!/bin/bash
set -e

echo "Starting Sentra Layanan UKM infrastructure setup..."

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required dependencies
echo "Installing dependencies..."
apt install -y curl unzip sqlite3

# Install Bun
echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc

# Install Caddy
echo "Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

# Create necessary directories
echo "Creating application directories..."
mkdir -p /var/www/html
mkdir -p /var/lib/sentra-ukm

# Create test HTML file
echo "Creating test HTML page..."
cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Sentra Layanan UKM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sentra Layanan UKM</h1>
        <p>Infrastructure setup successful!</p>
        <p>Transport & Delivery Platform</p>
    </div>
</body>
</html>
EOF

# Configure Caddy
echo "Configuring Caddy..."
cat > /etc/caddy/Caddyfile << 'EOF'
:80 {
    root * /var/www/html
    file_server
    encode gzip
    
    # Uncomment and update when domain is available
    # tls your-email@domain.com
}
EOF

# Create Bun app service
echo "Creating Bun app service..."
cat > /etc/systemd/system/bun-app.service << 'EOF'
[Unit]
Description=Sentra Layanan UKM Bun Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sentra-ukm
ExecStart=/bin/echo "Bun app placeholder - Service will be configured later"
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data /var/www/html
chown -R www-data:www-data /var/lib/sentra-ukm

# Enable and start services
echo "Enabling and starting services..."
systemctl enable caddy
systemctl start caddy
systemctl enable bun-app

echo "Setup complete! Please verify installation by following the steps in setup_task_1.1.md"