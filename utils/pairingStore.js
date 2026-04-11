// Sunucu RAM'inde geçici verileri tutmak için bir Map oluşturuyoruz.
// Bu yapı sunucu kapandığında temizlenir (geçici eşleşmeler için idealdir).
const pairingSessions = new Map();

module.exports = pairingSessions;