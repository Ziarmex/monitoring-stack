const mqtt = require('mqtt');

// Configuration MQTT
const MQTT_BROKER = 'mqtt://localhost:1883';
const client = mqtt.connect(MQTT_BROKER);

// Configuration des capteurs
const sensors = [
  {
    id: 'sensor_temp_01',
    topic: 'sensors/temperature/01',
    type: 'temperature',
    unit: '°C',
    min: 15,
    max: 80,
    threshold: 50,
    interval: 5000
  },
  {
    id: 'sensor_pressure_01',
    topic: 'sensors/pressure/01',
    type: 'pressure',
    unit: 'bar',
    min: 0.5,
    max: 10,
    threshold: 8,
    interval: 7000
  },
  {
    id: 'sensor_humidity_01',
    topic: 'sensors/humidity/01',
    type: 'humidity',
    unit: '%',
    min: 20,
    max: 95,
    threshold: 80,
    interval: 6000
  }
];

// Fonction pour générer une valeur aléatoire avec variation progressive
let previousValues = {};

function generateValue(sensor) {
  const sensorId = sensor.id;
  
  // Initialiser la valeur précédente si nécessaire
  if (!previousValues[sensorId]) {
    previousValues[sensorId] = (sensor.min + sensor.max) / 2;
  }
  
  // Variation progressive (-5% à +5% de la plage)
  const range = sensor.max - sensor.min;
  const variation = (Math.random() - 0.5) * range * 0.1;
  let newValue = previousValues[sensorId] + variation;
  
  // Limiter aux bornes
  newValue = Math.max(sensor.min, Math.min(sensor.max, newValue));
  
  // Arrondir à 2 décimales
  newValue = Math.round(newValue * 100) / 100;
  
  previousValues[sensorId] = newValue;
  
  return newValue;
}

// Fonction pour publier les données d'un capteur
function publishSensorData(sensor) {
  const value = generateValue(sensor);
  const timestamp = new Date().toISOString();
  
  const payload = {
    sensor_id: sensor.id,
    type: sensor.type,
    value: value,
    unit: sensor.unit,
    timestamp: timestamp,
    alert: value > sensor.threshold
  };
  
  const message = JSON.stringify(payload);
  
  client.publish(sensor.topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌ Erreur publication ${sensor.id}:`, err);
    } else {
      const alertIcon = payload.alert ? '🚨' : '✅';
      console.log(`${alertIcon} ${sensor.id}: ${value} ${sensor.unit} - ${timestamp}`);
      
      if (payload.alert) {
        console.log(`   ⚠️  ALERTE: Valeur au-dessus du seuil (${sensor.threshold})`);
      }
    }
  });
}

// Connexion au broker MQTT
client.on('connect', () => {
  console.log('🔌 Connecté au broker MQTT');
  console.log('📡 Démarrage de la simulation des capteurs...\n');
  
  // Démarrer la simulation pour chaque capteur
  sensors.forEach(sensor => {
    console.log(`🎯 Capteur ${sensor.id} initialisé (${sensor.type})`);
    console.log(`   Topic: ${sensor.topic}`);
    console.log(`   Intervalle: ${sensor.interval}ms`);
    console.log(`   Seuil alerte: ${sensor.threshold} ${sensor.unit}\n`);
    
    // Publication initiale
    publishSensorData(sensor);
    
    // Publications périodiques
    setInterval(() => {
      publishSensorData(sensor);
    }, sensor.interval);
  });
});

client.on('error', (err) => {
  console.error('❌ Erreur MQTT:', err);
});

client.on('offline', () => {
  console.log('⚠️  Broker MQTT hors ligne');
});

client.on('reconnect', () => {
  console.log('🔄 Reconnexion au broker MQTT...');
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt de la simulation...');
  client.end(() => {
    console.log('👋 Déconnecté du broker MQTT');
    process.exit(0);
  });
});

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   SIMULATEUR DE CAPTEURS INDUSTRIELS                  ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log('🔧 Configuration:');
console.log(`   Broker: ${MQTT_BROKER}`);
console.log(`   Capteurs: ${sensors.length}`);
console.log('');