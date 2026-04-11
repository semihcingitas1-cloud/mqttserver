const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {

        type: String,
        required: [true, "İsim zorunludur"],
        trim: true
    },
    email: {

        type: String,
        required: [true, "E-posta zorunludur"],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {

        type: String,
        trim: true
    },
    password: {

        type: String,
        required: [true, "Şifre zorunludur"],
        select: false
    },
    role: {

        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    homes: [{

        name: { 

            type: String, 
            required: true 
        },
        rooms: [{

            name: { 

                type: String, 
                required: true 
            },
            devices: [{

                type: mongoose.Schema.Types.ObjectId,
                ref: 'Device'
            }]
        }]
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);