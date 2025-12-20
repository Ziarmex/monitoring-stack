const mqtt = require('mqtt');
const MQTT_BROKER = 'mqtt://localhost:1883';

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('✅ Connecté au broker MQTT');

  const testTopic = 'sensors/temperature/01';
  const testPayload = JSON.stringify({
    sensor_id: 'sensor_temp_01',
    type: 'temperature',
    value: 42.5,
    unit: '°C',
    timestamp: new Date().toISOString(),
    alert: false
  });

  client.publish(testTopic, testPayload, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Erreur de publication:', err);
      process.exit(1);
    } else {
      console.log('📤 Message de test publié:', testPayload);
    }
  });

  client.subscribe(testTopic, (err) => {
    if (err) {
      console.error('❌ Erreur d\'abonnement:', err);
      process.exit(1);
    }
    console.log('📡 Abonné au topic', testTopic);
  });
});

client.on('message', (topic, message) => {
  console.log('📩 Reçu sur', topic, ':', message.toString());
  client.end();
  process.exit(0);
});

client.on('error', (err) => {
  console.error('❌ Erreur MQTT:', err);
  process.exit(1);
});

setTimeout(() => {
  console.error('⏱️ Temps écoulé : aucun message reçu');
  client.end();
  process.exit(1);
}, 10000);
