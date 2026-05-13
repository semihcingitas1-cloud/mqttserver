const express = require('express');
const { getMyAutomations, createAutomation, updateAutomation, deleteAutomation, triggerAutomationManually } = require('../controls/automation.js');
const { authenticationMid } = require('../middleware/auth.js');

const router = express.Router();

router.get('/my-automations', authenticationMid, getMyAutomations);

router.post('/create', authenticationMid, createAutomation);
router.patch('/:id', authenticationMid, updateAutomation);
router.delete('/:id', authenticationMid, deleteAutomation);
router.post('/trigger/:id', authenticationMid, triggerAutomationManually);

module.exports = router;