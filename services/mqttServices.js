const mqtt = require("mqtt");
const Device = require("../models/device");

const MQTT_BROKER = "mqtt://127.0.0.1:1883";
const CLIENT_ID = "backend-server";

console.log("🚀 MQTT servisi başlatılıyor...");
console.log(`📡 Broker: ${MQTT_BROKER}`);
console.log(`🆔 Client ID: ${CLIENT_ID}`);

const client = mqtt.connect(MQTT_BROKER, {

  clientId: CLIENT_ID,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

client.on("connect", () => {

  console.log("✅ MQTT Broker'a bağlandı!");
  console.log(`📋 Topic subscribe ediliyor: smarthome/+/status`);

  client.subscribe("smarthome/+/status", { qos: 1 }, (err, granted) => {

    if (err) {

      console.error("❌ Subscribe hatası:", err.message);
    } else {

      console.log(`✅ Subscribe başarılı → ${granted[0].topic} (QoS: ${granted[0].qos})`);
    }
  });
});

client.on("reconnect", () => {

  console.warn("🔄 MQTT yeniden bağlanmaya çalışıyor...");
});

client.on("disconnect", () => {

  console.warn("⚠️  MQTT bağlantısı kesildi.");
});

client.on("offline", () => {

  console.warn("📴 MQTT client offline durumda.");
});

client.on("error", (err) => {

  console.error("❌ MQTT bağlantı hatası:", err.message);
});

client.on("message", async (topic, message) => {

  const raw = message.toString();
  console.log(`\n📨 Mesaj alındı`);
  console.log(`   Topic  : ${topic}`);
  console.log(`   Payload: ${raw}`);

  try {

    const [prefix, serialNumber, action] = topic.split("/");

    if (prefix !== "smarthome" || action !== "status") {

      console.log(`⏭️  Geçersiz topic formatı, atlanıyor: ${topic}`);
      return;
    }

    let payload;

    try {

      payload = JSON.parse(raw);
      console.log(`✅ JSON parse başarılı:`, payload);
    } catch {

      payload = { value: raw };
      console.warn(`⚠️  JSON parse başarısız, ham değer kullanılıyor: ${raw}`);
    }

    console.log(`🔍 Cihaz aranıyor → serialNumber: ${serialNumber}`);

    const updatedDevice = await Device.findOneAndUpdate(

      { serialNumber },
      {

        $set: {
          "data.status": "online",
          "data.lastSeen": new Date(),
          "data.lastValue": payload.value || null,
          "data.signal": payload.signal || null,
          "data.battery": payload.battery || null,
          "data.relayState": payload.relayState || null,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedDevice) {

      console.warn(`⚠️  Pair edilmemiş cihaz, DB'de bulunamadı: ${serialNumber}`);
      return;
    }

    console.log(`✅ Cihaz güncellendi → ${updatedDevice.name} (${serialNumber})`);
    console.log(`   Status : online`);
    console.log(`   LastSeen: ${new Date().toISOString()}`);

  } catch (err) {

    console.error("❌ MQTT mesaj işleme hatası:", err.message);
  }
});

const sendCommand = (device, command) => {

  const topic = `smarthome/${device.serialNumber}/set`;
  const payload = JSON.stringify({ action: command });

  client.publish(topic, payload, { qos: 0, retain: false }, (err) => { 

    if (err) {

      console.error(`❌ Publish hatası:`, err.message);
    } else {

      console.log(`✅ Komut gönderildi → ${device.serialNumber} / ${command}`);
    }
  });
};

module.exports = { client, sendCommand };
