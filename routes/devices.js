const express = require('express');
const { getMyDevices, generatePairingCode, completePairing, deleteDevice, sendDeviceCommand  } = require('../controls/device.js');
const { authenticationMid, roleChecked } = require('../middleware/auth.js');

const router = express.Router();

router.get('/my-devices', authenticationMid, getMyDevices);
router.post('/generate-pairing-code', authenticationMid, generatePairingCode);
router.post('/complete-pairing', completePairing);
router.delete('/:id', authenticationMid, deleteDevice);
router.post('/command', authenticationMid, sendDeviceCommand);

module.exports = router;