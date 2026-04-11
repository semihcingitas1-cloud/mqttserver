const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({

    name: {

        type: String,
        required: true,
        trim: true
    },
    type: {

        type: String,
        required: true,
        enum: ['Gateway', 'Sensör', 'Güvenlik', 'İklimlendirme', 'Güç'],
        default: 'Sensör'
    },
    serialNumber: {

        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    pairingCode: {

        type: String, 
        unique: true, 
        sparse: true 
    },
    isPaired: {

        type: Boolean,
        default: false
    },
    version: {

        type: String,
        default: "v1.0"
    },
    data: {

        status: { 

            type: String, 
            enum: ['online', 'offline', 'warning'], 
            default: 'offline' 
        },
        lastValue: { 

            type: String, 
            default: "0" 
        },
        lastSeen: { 

            type: Date, 
            default: Date.now 
        },
        battery: {

            type: Number,
            default: null
        },
        signal: {

            type: String,
            default: "N/A"
        }
    },
    owner: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    homeId: mongoose.Schema.Types.ObjectId, 
    roomId: mongoose.Schema.Types.ObjectId 
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);