# Deployment Documentation

## System Requirements

- Ubuntu 22.04 LTS or newer
- Bun 1.0.0 or newer
- SQLite 3.37.0 or newer
- Caddy 2.7.0 or newer
- Systemd 249 or newer

## Installation Steps

1. Install dependencies:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install SQLite
sudo apt update
sudo apt install sqlite3

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

2. Clone the repository:
```bash
git clone https://github.com/your-org/sentra-layanan-ukm.git
cd sentra-layanan-ukm
```

3. Install project dependencies:
```bash
bun install
```

4. Set up the database:
```bash
# Create database and tables
cat sql/*.sql | sqlite3 data.db

# Load seed data
bun run scripts/seed_mitra_data.ts
```

5. Configure Caddy:

Create `/etc/caddy/Caddyfile`:
```
localhost {
    # Master Admin Dashboard
    handle /admin/* {
        reverse_proxy localhost:3000
    }

    # Mitra Admin Dashboard
    handle /mitra/* {
        reverse_proxy localhost:3000
    }

    # API endpoints
    handle /api/* {
        reverse_proxy localhost:3000
    }

    # Static files
    handle /* {
        root * /path/to/sentra-layanan-ukm/public
        file_server
    }
}
```

6. Create Systemd service:

Create `/etc/systemd/system/sentra-layanan-ukm.service`:
```ini
[Unit]
Description=Sentra Layanan UKM
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/sentra-layanan-ukm
ExecStart=/home/ubuntu/.bun/bin/bun run src/index.ts
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

7. Start services:
```bash
# Start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy

# Start application
sudo systemctl enable sentra-layanan-ukm
sudo systemctl start sentra-layanan-ukm
```

## Accessing the Dashboards

1. Master Admin Dashboard:
   - URL: http://localhost/admin
   - Username: admin
   - Password: admin123

2. Mitra Admin Dashboard:
   - URL: http://localhost/mitra
   - Username: mitra_admin
   - Password: password

## Monitoring

1. Check service status:
```bash
sudo systemctl status sentra-layanan-ukm
sudo systemctl status caddy
```

2. View logs:
```bash
sudo journalctl -u sentra-layanan-ukm
sudo journalctl -u caddy
```

## Backup

1. Database backup:
```bash
sqlite3 data.db ".backup 'backup.db'"
```

2. Files backup:
```bash
tar -czf backup.tar.gz public/ src/ sql/ scripts/ data.db
```

## Troubleshooting

1. Service won't start:
   - Check logs: `sudo journalctl -u sentra-layanan-ukm -n 50`
   - Verify permissions: `ls -l data.db`
   - Check port availability: `sudo lsof -i :3000`

2. Caddy issues:
   - Validate config: `caddy validate --config /etc/caddy/Caddyfile`
   - Check logs: `sudo journalctl -u caddy`
   - Verify permissions: `sudo chown -R caddy:caddy /etc/caddy`

3. Database issues:
   - Check permissions: `ls -l data.db`
   - Verify schema: `sqlite3 data.db ".schema"`
   - Test connection: `sqlite3 data.db "SELECT 1;"`

## Security Notes

1. Production deployment should:
   - Use HTTPS (Caddy handles this automatically)
   - Change default passwords
   - Implement proper authentication (task 1.10)
   - Set up firewall rules
   - Use environment variables for sensitive data

2. File permissions:
   - Database: 640
   - Config files: 644
   - Executables: 755
   - Logs: 640

3. Regular maintenance:
   - Update system packages
   - Backup database
   - Monitor logs
   - Check service status