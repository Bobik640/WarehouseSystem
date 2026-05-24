const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');

// Импорт маршрутов
const productRoutes = require('./routes/products');
const statsRoutes = require('./routes/stats');
const docsRoutes = require('./routes/docs');

const app = express();
const PORT = process.env.PORT || 3002;

// ====================
// MIDDLEWARE
// ====================

// Расширенные CORS настройки
app.use(cors({
    origin: [
        'https://warehousesystem-zljh.onrender.com',
        'https://frabjous-crisp-f8d61b.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:8080',
        'http://localhost:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(

    express.json({

        limit:'50mb'
    })
);

app.use(

    express.urlencoded({

        extended:true,

        limit:'50mb'
    })
);

// Логгер запросов
app.use(logger);

// ====================
// СТАТИЧЕСКИЕ ФАЙЛЫ
// ====================
const websitePath = path.join(__dirname, 'website');
console.log(`📁 Путь к статическим файлам: ${websitePath}`);
app.use(express.static(websitePath, {
    maxAge: '7d'
}));

// ====================
// ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ
// ====================
connectDB();

// ====================
// МАРШРУТЫ
// ====================

// Корневой маршрут - отдаем index.html
app.get('/', (req, res) => {
    const indexPath = path.join(websitePath, 'index.html');
    console.log(`📄 Отдаю файл: ${indexPath}`);
    res.sendFile(indexPath);
});

// API маршруты
app.use('/api/products', productRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api-docs', docsRoutes);

// ====================
// ЗАПУСК СЕРВЕРА
// ====================
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 WAREHOUSE API С MONGODB ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📍 API URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
    console.log(`📍 Главная страница: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/`);
    console.log(`📍 API документация: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api-docs`);
    console.log('='.repeat(60));
    console.log(`📁 Путь к статическим файлам: ${websitePath}`);
    console.log('='.repeat(60));
    console.log('✨ НОВЫЕ ФУНКЦИИ:');
    console.log('   📅 Добавлена поддержка срока годности для продуктов');
    console.log('   ⚠️ Автоматическое отслеживание просроченных товаров');
    console.log('   🔔 API для получения товаров с истекающим сроком');
    console.log('   🌐 Раздача статических файлов из папки "website"');
    console.log('='.repeat(60));
    console.log('📝 ДЛЯ ОСТАНОВКИ: Ctrl + C');
    console.log('='.repeat(60));
});

process.on('uncaughtException', (err) => {
    console.error('❌ Критическая ошибка:', err);
});
