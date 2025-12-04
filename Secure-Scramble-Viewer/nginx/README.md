# Nginx Configuration

This directory contains the Nginx reverse proxy configuration for SecureScramble Viewer.

## Files

- `nginx.conf` - Main Nginx configuration

## What It Does

Nginx acts as a reverse proxy, routing requests to the appropriate service:

```
Client Request
      ↓
   Nginx :80
      ↓
   ┌──────┴──────┐
   ↓             ↓
Frontend      Backend
(React)      (FastAPI)
```

## Routing

- `/*` → Frontend (React app)
- `/api/*` → Backend (FastAPI)
- `/docs` → Backend API documentation
- `/health` → Backend health check

## Features

- ✅ Reverse proxy
- ✅ Gzip compression
- ✅ Security headers
- ✅ Static file caching
- ✅ HTTPS ready (commented out)

## Enable HTTPS

### 1. Generate SSL Certificate

```bash
# Self-signed (for testing)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem

# Production: Use Let's Encrypt
# See DEPLOYMENT.md for details
```

### 2. Uncomment HTTPS Block

Edit `nginx.conf` and uncomment the HTTPS server block:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

### 3. Update Domain

Replace `your-domain.com` with your actual domain.

### 4. Restart Nginx

```bash
docker-compose restart nginx
```

## Customization

### Change Ports

```nginx
listen 8080;  # Change from 80 to 8080
```

### Add Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    # ... rest of config
}
```

### Add Basic Auth

```bash
# Create password file
htpasswd -c /etc/nginx/.htpasswd username
```

```nginx
location /admin {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ... rest of config
}
```

### Increase Upload Size

```nginx
client_max_body_size 500M;  # Change from 100M
```

## Testing Configuration

```bash
# Test config syntax
docker-compose exec nginx nginx -t

# Reload config
docker-compose exec nginx nginx -s reload
```

## Logs

```bash
# Access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 502 Bad Gateway

Backend is not running or not accessible.

```bash
# Check backend
docker-compose ps backend
docker-compose logs backend
```

### 404 Not Found

Route not configured correctly.

```bash
# Check nginx config
docker-compose exec nginx nginx -t

# Check logs
docker-compose logs nginx
```

### SSL Certificate Error

Certificate not found or invalid.

```bash
# Check certificate files
ls -la nginx/ssl/

# Verify certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

## Production Recommendations

1. **Use Let's Encrypt** for SSL certificates
2. **Enable HTTP/2** (already configured)
3. **Configure rate limiting** for API endpoints
4. **Set up monitoring** for Nginx
5. **Regular log rotation**
6. **Use CDN** for static files

## Security Headers

Already configured:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer-when-downgrade`

## Performance

Already optimized:
- Gzip compression enabled
- Static file caching (1 year)
- HTTP/2 support
- Keepalive connections

## More Information

See [DOCKER_SETUP.md](../DOCKER_SETUP.md) for complete Docker documentation.
