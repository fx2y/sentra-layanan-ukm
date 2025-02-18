# Deployment Documentation

## Prerequisites
- VM with Ubuntu/Debian Linux
- Bun runtime installed
- SQLite3 installed
- Caddy web server installed
- Systemd for service management

## Environment Setup
1. Set required environment variables in `/etc/environment`:
```
ADMIN_USER=master_admin
ADMIN_PASSWORD=your_secure_password
```

2. Create application directory:
```
mkdir -p /opt/sentra-layanan-ukm
```

## Application Deployment
1. Clone/copy application files to `/opt/sentra-layanan-ukm`
2. Install dependencies:
```
cd /opt/sentra-layanan-ukm
bun install
```

## Database Setup
1. Initialize SQLite database:
```
cd /opt/sentra-layanan-ukm
sqlite3 data.db < sql/schema.sql
```

2. Load seed data:
```
bun run src/seed.ts
```

## Systemd Service Configuration
1. Create service file at `/etc/systemd/system/sentra-ukm.service`:
```
[Unit]
Description=Sentra Layanan UKM Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sentra-layanan-ukm
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/local/bin/bun run src/index.ts
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:
```
systemctl enable sentra-ukm
systemctl start sentra-ukm
```

## Caddy Configuration
1. Update `/etc/caddy/Caddyfile`:
```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

2. Reload Caddy:
```
systemctl reload caddy
```

## Monitoring
- Check service status: `systemctl status sentra-ukm`
- View logs: `journalctl -u sentra-ukm`
- Monitor Caddy: `systemctl status caddy`

## Backup
Regular backups of the SQLite database file:
```
cp /opt/sentra-layanan-ukm/data.db /backup/data_$(date +%Y%m%d).db
```

## Updates
1. Stop service: `systemctl stop sentra-ukm`
2. Update code
3. Run migrations if any
4. Start service: `systemctl start sentra-ukm`

## Security Notes
- Ensure proper file permissions
- Keep system and dependencies updated
- Monitor logs for suspicious activity
- Use strong admin credentials
- Consider adding rate limiting
- Regular security audits