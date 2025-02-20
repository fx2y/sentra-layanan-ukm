# Deployment Documentation - Customer Web App

## Overview
This document outlines the deployment changes required for the customer web app component of the Sentra Layanan UKM platform.

## Changes from Previous Deployment

### 1. New Routes
Added customer-facing API endpoints:
- `/api/customer/services` - Service discovery
- `/api/customer/orders` - Order placement and management

### 2. Static Files
Added new static files:
- `/public/customer/index.html` - Customer app entry point
- `/public/styles.css` - Shared styles
- `/customer.js` - Bundled customer app JavaScript

### 3. Caddy Configuration
Updated Caddy configuration to serve the customer web app:

```caddy
# Existing configuration
www.sentra-layanan-ukm.com {
    # Admin routes
    handle /mitra/* {
        reverse_proxy localhost:3000
    }
    handle /api/mitra/* {
        reverse_proxy localhost:3000
    }

    # New customer routes
    handle /api/customer/* {
        reverse_proxy localhost:3000
    }
    handle /* {
        reverse_proxy localhost:3000
    }

    # Static files
    handle /public/* {
        root * /var/www/sentra-layanan-ukm/public
        file_server
    }

    # Compression and security
    encode gzip
    header {
        # CORS headers
        Access-Control-Allow-Origin *
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization"
        # Security headers
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
    }
}
```

### 4. Systemd Service
No changes required to the existing Systemd service configuration.

### 5. Build Process
Added customer app build steps:
```bash
# Build customer app
bun build src/customer.tsx --outdir public --target browser

# Build styles
bun run tailwindcss -i src/styles.css -o public/styles.css --minify
```

### 6. Environment Variables
No new environment variables required.

## Deployment Steps

1. **Update Code**
   ```bash
   # Pull latest changes
   git pull origin main

   # Install dependencies
   bun install
   ```

2. **Build Assets**
   ```bash
   # Build customer app
   bun build src/customer.tsx --outdir public --target browser

   # Build styles
   bun run tailwindcss -i src/styles.css -o public/styles.css --minify
   ```

3. **Update Caddy Configuration**
   ```bash
   # Copy new Caddy config
   sudo cp Caddyfile /etc/caddy/Caddyfile

   # Reload Caddy
   sudo systemctl reload caddy
   ```

4. **Restart Application**
   ```bash
   # Restart the application
   sudo systemctl restart sentra-layanan-ukm
   ```

5. **Verify Deployment**
   ```bash
   # Check service status
   sudo systemctl status sentra-layanan-ukm

   # Check logs
   sudo journalctl -u sentra-layanan-ukm -f

   # Test customer endpoints
   curl http://localhost:3000/api/customer/services
   ```

## Monitoring

Monitor the following additional metrics:
- Customer API endpoint response times
- Service discovery query performance
- Order placement success rate
- Frontend asset load times

## Rollback Plan

If issues are encountered:

1. **Revert Code**
   ```bash
   git reset --hard HEAD^
   ```

2. **Rebuild Assets**
   ```bash
   bun build src/customer.tsx --outdir public --target browser
   bun run tailwindcss -i src/styles.css -o public/styles.css --minify
   ```

3. **Restart Services**
   ```bash
   sudo systemctl restart sentra-layanan-ukm
   sudo systemctl reload caddy
   ```

## Security Considerations

1. **API Security**
   - Customer authentication/authorization to be implemented in task 1.6
   - Rate limiting on service discovery and order placement endpoints
   - Input validation on all customer endpoints

2. **Frontend Security**
   - CSP headers to prevent XSS
   - CORS configuration for API endpoints
   - Secure cookie handling

3. **Data Protection**
   - Order data encryption at rest
   - Secure transmission of customer information
   - Privacy policy compliance

## Performance Optimization

1. **Frontend**
   - Code splitting for customer app
   - Asset minification and compression
   - Browser caching configuration
   - Image optimization

2. **Backend**
   - Query optimization for service discovery
   - Connection pooling for database
   - Response caching where appropriate
   - API response compression 