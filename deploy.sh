#!/bin/bash

# Deployment script for Patient Elite on OVH VPS
set -e

echo "🚀 Starting deployment of Patient Elite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SSL certificates exist
if [ ! -f "./ssl/cert.pem" ] || [ ! -f "./ssl/key.pem" ]; then
    print_warning "SSL certificates not found in ./ssl/ directory"
    print_warning "Please add your SSL certificates:"
    print_warning "  - cert.pem (SSL certificate)"
    print_warning "  - key.pem (SSL private key)"
    print_warning ""
    print_warning "For Let's Encrypt certificates, you can use:"
    print_warning "  sudo certbot certonly --standalone -d patient-elite.elitemedicaleservices.tn"
    print_warning "  Then copy the files to ./ssl/"
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Remove old images to force rebuild
print_status "Removing old images..."
docker image prune -f || true

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test database connection
print_status "Testing database connection..."
docker-compose exec db pg_isready -U postgres

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_status "✅ Deployment completed successfully!"
print_status "🌐 Your application should be available at:"
print_status "   https://patient-elite.elitemedicaleservices.tn"
print_status ""
print_status "📊 To monitor logs: docker-compose logs -f"
print_status "🔄 To restart: docker-compose restart"
print_status "🛑 To stop: docker-compose down"
