const mongoose = require('mongoose');
const Automation = require('../models/automation.js');
const Device = require('../models/device.js');

const getMyAutomations = async (req, res) => {

  try {

    const userId = req.user.id;
    const automations = await Automation.find({ owner: userId }).lean();        
    res.status(200).json({ success: true, automations });
  } catch (error) {

    console.error("GET AUTOMATIONS ERROR:", error);
    res.status(500).json({ message: "Otomasyonlar yüklenemedi." });
  }
};

const createAutomation = async (req, res) => {

  try {

    const { name, trigger, conditions, actions, homeId } = req.body;

    const newAutomation = await Automation.create({

      name,
      owner: req.user.id,
      homeId,
      trigger,
      conditions,
      actions,
      isActive: true
    });

    res.status(201).json({ success: true, automation: newAutomation });
  } catch (error) {

    console.error("CREATE AUTOMATION ERROR:", error);
    res.status(500).json({ message: "Otomasyon oluşturulamadı." });
  }
};

const updateAutomation = async (req, res) => {

  try {

    const { id } = req.params;
    const updates = req.body;

    const automation = await Automation.findOneAndUpdate(

      { _id: id, owner: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!automation) {

      return res.status(404).json({ message: "Otomasyon bulunamadı veya yetkiniz yok." });
    }

    res.status(200).json({ success: true, automation });
  } catch (error) {

    console.error("UPDATE AUTOMATION ERROR:", error);
    res.status(500).json({ message: "Güncelleme başarısız." });
  }
};

const deleteAutomation = async (req, res) => {

  try {

    const { id } = req.params;
    const automation = await Automation.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!automation) {

      return res.status(404).json({ message: "Otomasyon bulunamadı." });
    }

    res.status(200).json({ success: true, message: "Otomasyon silindi." });

  } catch (error) {

    console.error("DELETE AUTOMATION ERROR:", error);
    res.status(500).json({ message: "Silme işlemi başarısız." });
  }
};

const triggerAutomationManually = async (req, res) => {

  try {

    const { id } = req.params;
    const automation = await Automation.findOne({ _id: id, owner: req.user.id }).populate('actions.deviceId');

    if (!automation || !automation.isActive) {

      return res.status(404).json({ message: "Otomasyon aktif değil veya bulunamadı." });
    }

    const { sendCommand } = require('../services/mqttServices.js');

    automation.actions.forEach(action => {

      sendCommand(action.deviceId, action.command); 
    });

    await Automation.findByIdAndUpdate(id, { lastTriggeredAt: new Date() });
    res.status(200).json({ success: true, message: "Otomasyon manuel olarak tetiklendi." });
  } catch (error) {

    console.error("TRIGGER AUTOMATION ERROR:", error);
    res.status(500).json({ message: "Otomasyon çalıştırılamadı." });
  }
};

module.exports = { getMyAutomations, createAutomation, updateAutomation, deleteAutomation,triggerAutomationManually };
