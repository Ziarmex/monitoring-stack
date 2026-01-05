# Architecture du Système

## Flux de données
```
Capteurs Simulés → MQTT (Mosquitto) → Node-RED → InfluxDB → Grafana
```

1. **Capteurs simulés** publient des données au format JSON via MQTT
2. **Mosquitto** achemine les messages vers Node-RED
3. **Node-RED** valide, transforme et écrit les données dans InfluxDB
4. **InfluxDB** stocke les séries temporelles
5. **Grafana** interroge InfluxDB et affiche les dashboards

## Technologies
| Composant   | Rôle                          | Version         |
|-------------|-------------------------------|-----------------|
| Mosquitto   | Broker MQTT                   | 2.0             |
| Node-RED    | Traitement des flux           | Dernière        |
| InfluxDB    | Base de données time-series   | 2.7             |
| Grafana     | Visualisation et dashboards   | Dernière        |

## Ports
| Service   | Port | URL                        |
|-----------|------|----------------------------|
| Grafana   | 3000 | http://localhost:3000      |
| Node-RED  | 1880 | http://localhost:1880      |
| InfluxDB  | 8086 | http://localhost:8086      |
| MQTT      | 1883 | mqtt://localhost:1883      |