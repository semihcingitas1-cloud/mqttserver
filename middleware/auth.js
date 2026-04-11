const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "SECRETTOKEN"; 

const authenticationMid = async(req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {

        token = req.cookies.token;
    } 

    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {

        console.log("--- AUTH HATASI: Token bulunamadı! ---");
        return res.status(401).json({ 
            success: false, 
            message: "Erişim için oturum açınız. Token bulunamadı." 
        });
    }

    try {
        const decodedData = jwt.verify(token, JWT_SECRET);

        req.user = await User.findById(decodedData.id).select("-password");

        if (!req.user) {
            console.log("--- AUTH HATASI: Token geçerli ama kullanıcı DB'de yok! ---");
            return res.status(401).json({ 
                success: false, 
                message: "Kullanıcı bulunamadı." 
            });
        }

        next();
    } catch (error) {
        console.log("--- AUTH HATASI: JWT Doğrulama Başarısız! ---", error.message);
        return res.status(401).json({ 
            success: false, 
            message: "Token geçersiz veya süresi dolmuş." 
        });
    }
};

const roleChecked = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Bu işlem için yetkiniz yok.` 
            });
        }
        next();
    };
};

module.exports = { authenticationMid, roleChecked };