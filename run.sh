#!/bin/bash
# BOOST Schema Validator - Docker Runner

set -e

echo "🐳 BOOST Schema Validator - Docker Setup"
echo "========================================"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Determine which docker compose command to use
DOCKER_COMPOSE="docker-compose"
if ! command -v docker-compose >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
        echo "🔧 Using 'docker compose' (newer Docker CLI)"
    else
        echo "❌ Neither 'docker-compose' nor 'docker compose' found"
        echo "   Please install Docker Compose:"
        echo "   - For newer Docker: it should be built-in"
        echo "   - For older Docker: install docker-compose separately"
        exit 1
    fi
else
    echo "🔧 Using 'docker-compose' (classic command)"
fi

# Check if we're in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the boost-validator-frontend directory"
    exit 1
fi

# Check if BOOST schema directory exists
if [ ! -d "../BOOST/schema" ]; then
    echo "❌ BOOST schema directory not found at ../BOOST/schema"
    echo "   Make sure you're running this from the boost-validator-frontend directory"
    echo "   within the BOOST-validator-project"
    exit 1
fi

echo "📋 Building and starting BOOST validator..."

# Build and start the service
$DOCKER_COMPOSE up --build -d

echo "⏳ Waiting for service to be ready..."
sleep 5

# Check if service is healthy
if $DOCKER_COMPOSE ps | grep -q "healthy\|Up"; then
    echo ""
    echo "🎉 BOOST Schema Validator is ready!"
    echo ""
    echo "📱 Access the validator at: http://localhost:5000"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:     $DOCKER_COMPOSE logs -f"
    echo "   Stop service:  $DOCKER_COMPOSE down"
    echo "   Restart:       $DOCKER_COMPOSE restart"
    echo ""
    echo "🌲 Available entities: $($DOCKER_COMPOSE exec boost-validator python -c "
import sys; sys.path.append('/app'); 
from backend.app import validator; 
print(len(validator.get_available_entities()))
" 2>/dev/null || echo "Loading...")"
else
    echo ""
    echo "⚠️  Service may still be starting. Check logs with:"
    echo "   $DOCKER_COMPOSE logs -f"
fi