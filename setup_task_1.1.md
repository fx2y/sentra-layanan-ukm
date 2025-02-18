# Task 1.1: Setup Base Infrastructure

## VM Provisioning

### Recommended VM Specifications
- Provider: DigitalOcean (Droplet) or equivalent
- OS: Ubuntu Server 22.04 LTS
- CPU: 2 vCPUs
- RAM: 2GB
- Storage: 50GB SSD
- Region: Singapore (closest to Indonesia)

### Initial Setup Steps
1. Create VM and configure SSH access
2. Update firewall rules to allow:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)

```bash
# On Ubuntu, configure UFW
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## Automated Installation

1. Clone this repository to your local machine
2. Make the installation script executable:
```bash
chmod +x scripts/install.sh
```
3. Run the installation script:
```bash
sudo ./scripts/install.sh
```

## Manual Verification Steps

### 1. Verify Bun Installation
```bash
bun -v
```

### 2. Verify SQLite Installation
```bash
sqlite3 --version
```

### 3. Verify Caddy Installation
```bash
caddy version
```

### 4. Check Systemd Services
```bash
# Check Caddy service status
systemctl status caddy

# Check Bun app service status
systemctl status bun-app

# Verify services are enabled
systemctl is-enabled caddy
systemctl is-enabled bun-app
```

### 5. Verify Web Server
1. Access your domain/IP in a web browser
2. Verify HTTPS is working (green padlock)
3. You should see the test page

## Configuration Files

### Caddy Configuration
Located at `/etc/caddy/Caddyfile`

### Bun App Service
Located at `/etc/systemd/system/bun-app.service`

## Database Location
SQLite database will be created at: `/var/lib/sentra-ukm/database.db`

## Testing
1. Visit: https://your-domain.com
2. Expected result: Simple welcome page
3. Verify HTTPS is working correctly

## Post-Installation
1. Configure your actual domain in the Caddyfile
2. Update DNS records to point to your VM's IP
3. Caddy will automatically obtain SSL certificates

## Monitoring
- Monitor system logs: `journalctl -u caddy`
- Monitor Bun app logs: `journalctl -u bun-app`