require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const db = require('./config/db.js');

require("./services/mqttBroker.js");
const mqttServices = require('./services/mqttServices.js');

const user = require('./routes/user.js');
const device = require('./routes/devices.js');

const app = express();

app.use(cors({

  origin: (origin, callback) => {

    const allowedOrigins = ['http://localhost:3000'];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {

      callback(null, true);
    } else {

      callback(new Error(`CORS engellendi: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db();

app.use('/', user);
app.use('/api/devices', device);
app.get('/', (req, res) => {

  res.send('Akıllı Ev ve Web Backend Sunucusu Çalışıyor...');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {

  console.log(`Server is running on Port: ${PORT}.`);
});