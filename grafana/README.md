# Configuration Grafana

## Import du Dashboard
1. Dashboards → Import
2. Upload `dashboards/industrial-monitoring.json`
3. Sélectionner la datasource InfluxDB

## Configuration de la datasource
- Type: InfluxDB (Flux)
- URL: http://influxdb:8086
- Organization: industrial
- Bucket: sensors