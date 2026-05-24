const mongoose = require('mongoose');

// Подключение к MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://warehouseAppUser:g0LR5Vy6My3maeI9@cluster0.x2j9woq.mongodb.net/warehouse?retryWrites=true&w=majority';

const connectDB = async () => {
    console.log('🔄 Подключение к MongoDB Atlas...');
    
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ УСПЕХ! MongoDB Atlas подключена!');
        console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouseDB'}`);
        console.log(`📍 Хост: ${mongoose.connection.host}`);
        console.log('📊 Режим: облачная база данных');
    } catch (err) {
        console.log('❌ Ошибка подключения к MongoDB Atlas:');
        console.log(`   Сообщение: ${err.message}`);
        console.log(`   Код: ${err.code}`);
        console.log('⚠️  Работаем с данными в памяти');
    }
};

module.exports = connectDB;