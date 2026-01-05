# Mini Système de Supervision Industrielle

Système complet de monitoring industriel avec collecte de données temps réel, traitement, stockage et visualisation.

## Architecture

```
Capteurs Simulés → MQTT (Mosquitto) → Node-RED → InfluxDB → Grafana
```

### Composants

- Mosquitto : Broker MQTT pour la communication entre capteurs
- Node-RED : Traitement et routage des flux de données
- InfluxDB 2.x : Base de données time-series
- Grafana : Dashboards de visualisation
- Simulateur : Script Node.js générant des données capteurs

## Installation et Démarrage

### Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 16.x (pour le simulateur)
- 4GB RAM minimum

### Étape 1 : Lancer le stack Docker

```bash
# Lancer tous les services (build inclut l'image Node-RED custom)
docker compose up -d --build

# Vérifier les logs
docker compose logs -f
```

Temps de démarrage : ~30 secondes

> **Auto-configuration** : InfluxDB, le flow Node-RED, la datasource Grafana et le dashboard sont automatiquement provisionnés. Aucune configuration manuelle nécessaire.

### Étape 2 : Lancer le simulateur de capteurs

```bash
# Installer les dépendances
npm install

# Démarrer la simulation
npm start
```

## Accès aux Services

| Service   | URL                     | Identifiants             |
|-----------|-------------------------|--------------------------|
| Grafana   | http://localhost:3000   | admin / admin            |
| Node-RED  | http://localhost:1880   | -                        |
| InfluxDB  | http://localhost:8086   | admin / adminpassword    |
| MQTT      | mqtt://localhost:1883   | -                        |

## Fonctionnalités

### Capteurs Simulés

Le simulateur génère 3 types de données :

1. Température (sensor_temp_01)
   - Plage : 15-80°C
   - Seuil alerte : 50°C
   - Fréquence : toutes les 5s

2. Pression (sensor_pressure_01)
   - Plage : 0.5-10 bar
   - Seuil alerte : 8 bar
   - Fréquence : toutes les 7s

3. Humidité (sensor_humidity_01)
   - Plage : 20-95%
   - Seuil alerte : 80%
   - Fréquence : toutes les 6s

### Topics MQTT

```
sensors/temperature/01
sensors/pressure/01
sensors/humidity/01
```

### Format des messages

```json
{
  "sensor_id": "sensor_temp_01",
  "type": "temperature",
  "value": 45.32,
  "unit": "°C",
  "timestamp": "2025-11-07T10:30:45.123Z",
  "alert": false
}
```

## Tests et Validation

### Test 1 : Connectivité MQTT

```bash
# Avec mosquitto_sub (si installé)
mosquitto_sub -h localhost -t "sensors/#" -v

# Vous devriez voir les messages des capteurs défiler
```

### Test 2 : Données dans InfluxDB

1. Accéder à http://localhost:8086
2. Explorateur de données
3. Requête :
```flux
from(bucket: "sensors")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
```

### Test 3 : Visualisation Grafana

1. Accéder au dashboard "Supervision Industrielle"
2. Vérifier que les graphiques se mettent à jour en temps réel
3. Observer les jauges pour les valeurs actuelles
4. Attendre qu'une alerte se déclenche (valeur > seuil)

### Test 4 : Stabilité

```bash
# Laisser tourner pendant 1h et surveiller
docker stats

# Les ressources doivent rester stables
```

## Dépannage

### Les capteurs ne publient pas

```bash
# Vérifier que Mosquitto est démarré
docker compose ps mosquitto

# Vérifier les logs
docker compose logs mosquitto

# Tester la connexion
telnet localhost 1883
```

### Node-RED ne reçoit pas les messages

1. Vérifier la configuration du broker MQTT dans Node-RED
2. Déployer à nouveau le flow
3. Vérifier l'onglet Debug dans Node-RED

### Les données n'apparaissent pas dans InfluxDB

1. Vérifier le token dans Node-RED
2. Tester la connexion InfluxDB dans Node-RED
3. Vérifier les logs : `docker compose logs influxdb`

### Grafana n'affiche pas les données

1. Vérifier la source de données (Test & Save)
2. Examiner les requêtes dans le dashboard (mode Edit)
3. Vérifier les logs : `docker compose logs grafana`

## Performances

### Métriques attendues

- Latence bout-en-bout : < 1s
- CPU : ~5-10% (avec 3 capteurs)
- RAM : ~500MB total
- Stockage : ~10MB/jour

### Limites

- Capteurs simultanés : ~100 (avec config par défaut)
- Fréquence max : 1 message/seconde par capteur
- Rétention InfluxDB : 30 jours par défaut

## Configuration Avancée

### Ajouter des capteurs

Modifier `simulator/sensor_simulator.js` :

```javascript
{
  id: 'sensor_voltage_01',
  topic: 'sensors/voltage/01',
  type: 'voltage',
  unit: 'V',
  min: 110,
  max: 240,
  threshold: 230,
  interval: 8000
}
```

### Modifier la rétention InfluxDB

Dans l'interface InfluxDB :
1. Data → Buckets
2. Éditer le bucket "sensors"
3. Changer la politique de rétention

### Activer l'authentification MQTT

Modifier `mosquitto.conf` :

```conf
allow_anonymous false
password_file /mosquitto/config/passwd
```

Créer le fichier de mots de passe :

```bash
docker exec mosquitto mosquitto_passwd -c /mosquitto/config/passwd username
```

## Structure du Projet

```
monitoring-stack/
├── docker-compose.yml          # Configuration Docker
├── package.json                # Dépendances Node.js
├── simulator/
│   └── sensor_simulator.js     # Simulateur de capteurs
├── node-red/
│   ├── Dockerfile             # Image Node-RED custom
│   └── nodered_flows.json     # Flows Node-RED
├── grafana/
│   ├── provisioning/
│   │   └── datasources/
│   │       └── influxdb.yml   # Datasource auto-config
│   └── dashboards/
│       └── grafana_dashboard.json  # Dashboard Grafana
├── test/
│   └── test-mqtt.js           # Test MQTT
├── mosquitto/
│   ├── config/
│   │   └── mosquitto.conf     # Config MQTT
│   ├── data/                  # Données persistées
│   └── log/                   # Logs Mosquitto
├── docs/
│   └── Architecture.md        # Documentation architecture
└── README.md                  # Documentation
```

## Arrêt et Nettoyage

```bash
# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (perte de données)
docker compose down -v

# Arrêter le simulateur
Ctrl+C dans le terminal
```

## Maintenance

### Backup des données

```bash
# Backup InfluxDB
docker exec influxdb influx backup /tmp/backup
docker cp influxdb:/tmp/backup ./backup-$(date +%Y%m%d)

# Backup Grafana
docker exec grafana grafana-cli admin export-dashboard > dashboards-backup.json
```

### Mise à jour

```bash
# Mettre à jour les images
docker compose pull

# Redémarrer les services
docker compose up -d
```

## Améliorations Possibles

- [ ] Authentification MQTT avec SSL/TLS
- [ ] Alerting Grafana par email
- [ ] API REST pour injecter des données
- [ ] Panel Grafana pour contrôler les capteurs
- [ ] Export des données en CSV
- [ ] Logs centralisés (ELK Stack)
- [ ] Monitoring des conteneurs (Prometheus)

## Ressources

- [Documentation InfluxDB](https://docs.influxdata.com/influxdb/v2/)
- [Documentation Grafana](https://grafana.com/docs/)
- [Documentation Node-RED](https://nodered.org/docs/)
- [MQTT Protocol](https://mqtt.org/)

## Support

Pour toute question ou problème :
1. Vérifier les logs : `docker compose logs`
2. Consulter la section Dépannage
3. Vérifier la configuration des services

---

Développé pour un environnement de démonstration et d'apprentissage