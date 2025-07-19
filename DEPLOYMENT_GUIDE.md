# Patient Elite - Docker Deployment Guide

## 🎯 Project Overview

**Patient Elite** is a Next.js application for managing patient records and sales data. This document outlines the complete deployment process on an OVH VPS using Docker and Nginx.

## 🚀 Initial Goal

Deploy the Next.js application on OVH VPS with:
- Docker containerization
- Nginx reverse proxy
- PostgreSQL database integration
- SSL/HTTPS support (future)
- Domain access: `patient-elite.elitemedicaleservices.tn`

## 📋 System Architecture

```
Internet → System Nginx (Port 80) → Docker Container (Port 3002) → PostgreSQL (localhost:5432)
```

## 🛠️ Step-by-Step Deployment Journey

### Step 1: Initial Docker Setup
**Goal**: Integrate Nginx into Docker Compose for automated deployment

**Actions Taken**:
- Created `nginx/nginx.conf` with SSL configuration
- Updated `docker-compose.yml` to include:
  - PostgreSQL database service
  - Next.js web application
  - Nginx reverse proxy
- Added SSL certificate directory structure

**Issues Encountered**:
- SSL certificates missing (expected)
- Complex multi-service setup

### Step 2: Database Configuration Issues
**Problem**: User wanted to use existing PostgreSQL database on host, not containerized

**Actions Taken**:
- Removed PostgreSQL service from docker-compose
- Updated database connection to use host database
- Changed `DATABASE_URL` to point to `localhost:5432`

**Configuration**:
```yaml
environment:
  - DATABASE_URL=postgres://postgres:admin@localhost:5432/elite_patient
```

### Step 3: SSL Certificate Issues
**Problem**: Nginx container failing due to missing SSL certificates

**Error**:
```
nginx: [emerg] cannot load certificate "/etc/nginx/ssl/cert.pem": BIO_new_file() failed
```

**Actions Taken**:
- Created HTTP-only Nginx configuration
- Removed SSL/HTTPS requirements temporarily
- Updated `listen 443 ssl` to `listen 80`

### Step 4: Port Conflicts
**Problem**: Port 80 already in use by existing system Nginx

**Error**:
```
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address in use)
```

**Actions Taken**:
- Changed Docker Nginx ports to `8080:80` and `8443:443`
- Planned to use system Nginx as proxy to Docker Nginx

### Step 5: Host Networking Issues
**Problem**: With `network_mode: "host"`, port mapping is ignored, causing same port conflicts

**Actions Taken**:
- Removed host networking from Nginx container
- Used proper Docker networks
- Updated upstream configuration

### Step 6: Database Connection Issues
**Problem**: Docker containers couldn't access host PostgreSQL database

**Error**:
```
User was denied access on the database `192.168.208.2`
```

**Actions Taken**:
- Used `host.docker.internal` for database connection
- Added `extra_hosts` configuration
- Switched back to host networking for web service

### Step 7: Authentication Issues
**Problem**: Login failing with 401 errors and proxy issues

**Logs**:
```
POST /api/auth/callback/credentials HTTP/1.1" 401
upstream prematurely closed connection
```

**Actions Taken**:
- Updated environment variables for HTTP (not HTTPS)
- Changed `COOKIE_SECURE=false` and `COOKIE_SAME_SITE=lax`
- Fixed database connection string

### Step 8: Nginx Container Conflicts
**Problem**: Docker Nginx container conflicting with system Nginx

**Actions Taken**:
- Removed Docker Nginx container completely
- Simplified to single Next.js container with host networking
- Configured system Nginx to proxy to `localhost:3002`

### Step 9: Persistent Nginx Errors
**Problem**: Still getting "host not found in upstream 'web:3002'" errors

**Root Cause**: Orphaned Docker containers or configurations still running

**Current Status**: Troubleshooting container cleanup

## 🔧 Current Configuration

### Docker Compose (Final)
```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: patient-elite-web
    network_mode: "host"
    environment:
      - DATABASE_URL=postgres://postgres:admin@localhost:5432/elite_patient
      - DIRECT_URL=postgres://postgres:admin@localhost:5432/elite_patient
      - NEXT_PUBLIC_APP_URL=http://patient-elite.elitemedicaleservices.tn
      - NODE_ENV=production
      - JWT_SECRET=128791827398127389
      - COOKIE_SECURE=false
      - COOKIE_SAME_SITE=lax
      - NEXTAUTH_URL=http://patient-elite.elitemedicaleservices.tn
      - NEXTAUTH_SECRET=F8mSyM6FuQaKN1p18oPuqpd2pu3ABldMSm1Gt1Ng3/8=
    restart: unless-stopped
```

### System Nginx Configuration
```nginx
server {
    listen 80;
    server_name patient-elite.elitemedicaleservices.tn;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Issues Encountered & Solutions

### 1. SSL Certificate Management
- **Issue**: Missing SSL certificates causing container failures
- **Solution**: Implemented HTTP-only configuration initially
- **Future**: Add Let's Encrypt certificates for HTTPS

### 2. Port Conflicts
- **Issue**: Multiple services trying to bind to port 80
- **Solution**: Use system Nginx as single entry point, Docker containers on different ports

### 3. Database Access
- **Issue**: Docker containers couldn't access host PostgreSQL
- **Solution**: Use host networking for database access

### 4. Network Configuration Complexity
- **Issue**: Mixed networking modes causing confusion
- **Solution**: Simplified to host networking for web service

### 5. Container Cleanup
- **Issue**: Orphaned containers causing persistent errors
- **Solution**: Comprehensive container and volume cleanup

## ✅ Working Solution

### Architecture
```
Internet → System Nginx (Port 80) → Next.js Container (Host Network, Port 3002) → PostgreSQL (localhost:5432)
```

### Key Components
1. **Single Docker Container**: Next.js app with host networking
2. **System Nginx**: Handles domain routing and SSL termination
3. **Host Database**: PostgreSQL running directly on VPS
4. **HTTP Configuration**: Simplified without SSL complexity

## 🔮 Future Improvements

### 1. SSL/HTTPS Implementation
```bash
# Add Let's Encrypt certificates
sudo certbot certonly --standalone -d patient-elite.elitemedicaleservices.tn
```

### 2. Database Security
- Configure PostgreSQL to accept specific IP ranges
- Use connection pooling
- Implement database backups

### 3. Monitoring & Logging
- Add container health checks
- Implement log aggregation
- Set up monitoring dashboards

### 4. CI/CD Pipeline
- Automated deployment from Git
- Environment-specific configurations
- Rollback capabilities

## 🚨 Troubleshooting Commands

### Container Management
```bash
# Stop all containers
docker-compose down

# Remove all containers
docker container prune -f

# Check running containers
docker ps -a

# View container logs
docker-compose logs -f web
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Testing
```bash
# Test database connection
psql -h localhost -U postgres -d elite_patient

# Check database status
sudo systemctl status postgresql
```

## 📊 Lessons Learned

1. **Simplicity First**: Complex multi-container setups can introduce unnecessary complications
2. **Network Understanding**: Docker networking modes have significant implications
3. **Incremental Deployment**: Test each component individually before integration
4. **Environment Consistency**: Development vs. production environment differences cause issues
5. **Container Cleanup**: Always ensure clean state when troubleshooting

## 🎯 Final Status

**Current State**: Deployment in progress with container cleanup needed
**Next Steps**: 
1. Complete container cleanup
2. Verify system Nginx configuration
3. Test application functionality
4. Implement SSL certificates

**Expected Result**: Fully functional Next.js application accessible via domain name with proper authentication and database connectivity.
