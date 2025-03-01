# Architecture du Système




## Flux de données
1. Capteurs → MQTT
2. MQTT → Node-RED
3. Node-RED → InfluxDB
4. InfluxDB → Grafana

## Technologies
- Mosquitto 2.0
- Node-RED latest
- InfluxDB 2.7
- Grafana latest