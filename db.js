const mongoose = require('mongoose');

const link = 'mongodb+srv://root:20042004@cluster0.jrdyc1g.mongodb.net/';

const db = () => {

    mongoose.connect(link, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
    .then(() =>{

        console.log(`mongo db is connected in: ${link}`);
    })
    .catch((err) => {

        console.error("MongoDB Connection Error");
        console.log(err);
        process.exit(1);
    })
};


module.exports = db;