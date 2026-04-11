const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {

    client.subscribe('Deneme');
    console.log('Connected to MQTT server and subscribed to topic "Deneme"');
});

client.on('message', (topic, message) => {

    console.log(`Received message on topic ${topic}: ${message.toString()}`);
});