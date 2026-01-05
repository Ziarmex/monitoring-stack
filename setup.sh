#!/bin/bash

# Script de configuration automatique du système de monitoring
# Usage: ./setup.sh

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Configuration du Système de Supervision Industrielle ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Vérification de Docker
info "Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Installer Docker Desktop depuis https://www.docker.com/products/docker-desktop"
fi
info "✓ Docker installé: $(docker --version)"

# Vérification de Docker Compose
info "Vérification de Docker Compose..."
if ! docker compose version &> /dev/null; then
    error "Docker Compose n'est pas installé."
fi
info "✓ Docker Compose installé: $(docker compose version)"

# Vérification de Node.js
info "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    warning "Node.js n'est pas installé. Le simulateur ne pourra pas fonctionner."
    warning "Installer Node.js depuis https://nodejs.org/"
else
    info "✓ Node.js installé: $(node --version)"
fi

# Création de la structure des dossiers
info "Création de la structure des dossiers..."
mkdir -p mosquitto/{config,data,log}
mkdir -p grafana/provisioning/{datasources,dashboards}
info "✓ Dossiers créés"

# Copie du fichier de configuration Mosquitto
info "Configuration de Mosquitto..."
if [ ! -f mosquitto/config/mosquitto.conf ]; then
    cat > mosquitto/config/mosquitto.conf << 'EOF'
listener 1883
protocol mqtt

listener 9001
protocol websockets

allow_anonymous true

log_dest file /mosquitto/log/mosquitto.log
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information

persistence true
persistence_location /mosquitto/data/

max_queued_messages 1000
message_size_limit 0
max_connections -1
EOF
    info "✓ mosquitto.conf créé"
else
    info "✓ mosquitto.conf existe déjà"
fi

# Configuration des permissions
info "Configuration des permissions..."
chmod -R 755 mosquitto
info "✓ Permissions configurées"

# Lancement des services Docker
info "Lancement des services Docker (cela peut prendre quelques minutes)..."
docker compose up -d --build

# Attendre que les services démarrent
info "Attente du démarrage des services..."
sleep 30

# Vérification des services
info "Vérification des services..."
services=("mosquitto" "influxdb" "nodered" "grafana")
for service in "${services[@]}"; do
    if docker compose ps | grep -q "$service.*Up"; then
        info "✓ $service est démarré"
    else
        error "$service n'a pas démarré correctement"
    fi
done

# Installation des dépendances Node.js
if command -v npm &> /dev/null; then
    info "Installation des dépendances Node.js..."
    npm install
    info "✓ Dépendances installées"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              Configuration Terminée !                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Services disponibles:"
echo "   • Grafana:   http://localhost:3000 (admin/admin)"
echo "   • Node-RED:  http://localhost:1880"
echo "   • InfluxDB:  http://localhost:8086 (admin/adminpassword)"
echo "   • MQTT:      mqtt://localhost:1883"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Lancer le simulateur: npm start"
echo "   2. Accéder à Grafana: http://localhost:3000 (admin/admin)"
echo "   3. Dashboard 'Supervision Industrielle' déjà pré-configuré"
echo ""
echo "📖 Consultez le README.md pour plus de détails"
echo ""