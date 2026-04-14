const mongoose = require('mongoose');
const Device = require('../models/device.js');
const User = require('../models/user.js');

const { sendCommand } = require('../services/mqttServices.js');
const pairingSessions = require('../utils/pairingStore');

const getMyDevices = async (req, res) => {

  try {

    if (!req.user || !req.user.id) {

      return res.status(401).json({ message: "Yetkisiz erişim: Kullanıcı ID bulunamadı." });
    }

    const userId = req.user.id; 

    const devices = await Device.find({

      $or: [

        { owner: userId },
        { owner: new mongoose.Types.ObjectId(userId) }
      ]
    }).lean();

    res.status(200).json({ success: true, devices });

  } catch (error) {

    console.error("GET MY DEVICES HATASI:", error); 
    res.status(500).json({ message: "Cihazlar getirilirken sunucu hatası oluştu." });
  }
};

const generatePairingCode = async (req, res) => {

  try {

    const { homeId, roomId, name, type } = req.body;
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();

    pairingSessions.set(code, {

      owner: req.user.id,
      homeId,
      roomId,
      name,
      type,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    console.log(`🔑 Kod Üretildi: ${code} | Kullanıcı: ${req.user.id}`);
    res.status(200).json({ success: true, code });

  } catch (error) {

    console.log(req.body);
    console.error("GENERATE CODE HATASI:", error);
    res.status(500).json({ message: "Kod üretilemedi." });
  }
};

const completePairing = async (req, res) => {

  try {

    console.log("📥 İstek geldi:", req.body);
    const { pairingCode, serialNumber } = req.body;

    if (!pairingCode || !serialNumber) {
      console.log("❌ pairingCode veya serialNumber eksik");
      return res.status(400).json({ success: false, message: "Eksik parametre" });
    }


    const session = pairingSessions.get(pairingCode);

    console.log("🔍 Session:", session);
    console.log("📋 Tüm sessionlar:", [...pairingSessions.entries()]);


    if (!session) {

      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    if (Date.now() > session.expiresAt) {

      pairingSessions.delete(pairingCode);
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    const newDevice = await Device.create({

      owner: session.owner, 
      homeId: session.homeId, 
      roomId: session.roomId, 
      name: session.name || "Yeni Cihaz", 
      type: session.type, 
      serialNumber, 
      isPaired: true,
      data: {
        status: "online",
        lastSeen: new Date()
      }

    });

    console.log("Yeni cihaz oluşturuldu:", newDevice);
    pairingSessions.delete(pairingCode);
    return res.status(200).json({ success: true, device: newDevice });

  } catch (error) {

    console.error(error);

    return res.status(500).json({ success: false, message: "Pairing failed" });
  }
};

const deleteDevice = async (req, res) => {

  try {

    const device = await Device.findById(req.params.id);

    if (!device) {

      return res.status(404).json({ message: "Cihaz bulunamadı." });
    }

    if (device.owner.toString() !== req.user.id) {

      return res.status(401).json({ message: "Bu işlem için yetkiniz yok." });
    }

    await device.deleteOne();
    res.status(200).json({ success: true, message: "Cihaz sistemden silindi." });
  } catch (error) {

    console.error("DELETE DEVICE HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const sendDeviceCommand = async (req, res) => {

  try {

    const { serialNumber, action } = req.body;
    const device = await Device.findOneAndUpdate( { serialNumber }, { $set: { "data.relayState": action } }, { returnDocument: 'after' } );

    if (!device) {

      return res.status(404).json({ message: "Cihaz bulunamadı" });
    }

    if (device.owner.toString() !== req.user.id) {

      return res.status(401).json({ message: "Bu işlem için yetkiniz yok." });
    }

    sendCommand(device, action);

    await Device.findOneAndUpdate(

      { serialNumber },
      { $set: { "data.relayState": action } }
    );

    res.status(200).json({ success: true, action, serialNumber });
  } catch (error) {

    console.error("COMMAND HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyDevices, generatePairingCode, completePairing, deleteDevice, sendDeviceCommand };