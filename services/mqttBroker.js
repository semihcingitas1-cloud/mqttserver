const Aedes = require("aedes");
const net = require("net");

const aedes = new Aedes({

  persistence: null
});

aedes.authorizePublish = (client, packet, callback) => {

  packet.retain = false;
  callback(null);
};

const server = net.createServer(aedes.handle);

server.listen(1883, "0.0.0.0", () => {

  console.log(`✅ MQTT Broker çalışıyor → port 1883`);
});

aedes.on("client", (client) => {

  console.log(`🔌 Bağlandı: ${client.id}`);
});

aedes.on("clientDisconnect", (client) => {

  console.warn(`❌ Ayrıldı: ${client.id}`);
});

module.exports = aedes;