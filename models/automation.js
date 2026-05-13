const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({

    name: {

        type: String,
        required: true,
        trim: true
    },
    owner: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    homeId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
        required: true,
        index: true
    },
    isActive: {

        type: Boolean,
        default: true
    },
    trigger: {

        source: { 

            type: String, 
            enum: ['DEVICE', 'TIME', 'MANUAL'], 
            required: true 
        },
        deviceId: { 

            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Device' 
        },
        condition: { 

            type: String, 
            enum: ['GT', 'LT', 'EQ', 'CHANGE'] 
        },
        value: mongoose.Schema.Types.Mixed, 
        time: {
            type: String,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/
        }
    },
    conditions: [{

        property: { type: String }, 
        operator: { type: String }, 
        value: mongoose.Schema.Types.Mixed
    }],
    actions: [{

        deviceId: { 

            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Device',
            required: true 
        },
        command: { 
            type: String, 
            required: true 
        },
        payload: mongoose.Schema.Types.Mixed
    }],
    lastTriggeredAt: {

        type: Date
    }
}, { timestamps: true });

automationSchema.index({ homeId: 1, isActive: 1 });

module.exports = mongoose.model('Automation', automationSchema);