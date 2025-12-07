const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// ====================
// WAREHOUSE API WITH MONGODB ATLAS
// ====================

console.log('🔧 Загрузка Warehouse API с MongoDB Atlas...');

const app = express();
const PORT = process.env.PORT || 3002;

// РАСШИРЕННЫЕ CORS НАСТРОЙКИ ДЛЯ ФРОНТЕНДА
app.use(cors({
    origin: ['https://warehousesystem-zljh.onrender.com', 'http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/warehouseDB';

console.log('🔄 Подключение к MongoDB Atlas...');

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ УСПЕХ! MongoDB Atlas подключена!');
    console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouseDB'}`);
    console.log(`📍 Хост: ${mongoose.connection.host}`);
    console.log('📊 Режим: облачная база данных');
})
.catch(err => {
    console.log('❌ Ошибка подключения к MongoDB Atlas:');
    console.log(`   Сообщение: ${err.message}`);
    console.log(`   Код: ${err.code}`);
    console.log('⚠️  Работаем с данными в памяти');
});

// Схема и модель для товаров
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Название товара обязательно'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Количество обязательно'],
        min: [0, 'Количество не может быть отрицательным']
    },
    category: {
        type: String,
        default: 'Разное',
        trim: true
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Цена не может быть отрицательной']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

// Временное хранилище в памяти (если MongoDB недоступна)
let inMemoryProducts = [];
let nextId = 1;

// Логгирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 📍 КОРНЕВОЙ МАРШРУТ
app.get('/', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА';
    const mongoStatusClass = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>📦 Warehouse API с MongoDB Atlas</title>
            <style>
                body { font-family: Arial; padding: 40px; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; }
                .container { background: white; padding: 40px; border-radius: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                h1 { color: #27ae60; text-align: center; margin-bottom: 30px; font-size: 2.5rem; }
                .status-container { text-align: center; margin: 30px 0; }
                .mongo-status { padding: 15px; border-radius: 10px; display: inline-block; font-size: 1.2rem; font-weight: bold; }
                .connected { background: #d4edda; color: #155724; border: 3px solid #c3e6cb; }
                .disconnected { background: #f8d7da; color: #721c24; border: 3px solid #f5c6cb; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .info-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #3498db; }
                .endpoint { background: #f1f5f9; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #e2e8f0; }
                code { background: #2c3e50; color: white; padding: 8px 12px; border-radius: 6px; display: block; margin: 10px 0; font-family: monospace; }
                .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 5px; font-weight: bold; }
                .btn:hover { background: #5a67d8; }
                .alert { background: #fff3cd; border: 2px solid #ffeaa7; padding: 15px; border-radius: 10px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏭 Warehouse Management API</h1>
                
                <div class="status-container">
                    <div class="mongo-status ${mongoStatusClass}">
                        <strong>MongoDB Atlas статус:</strong> ${mongoStatus}
                    </div>
                </div>
                
                <div class="alert">
                    <strong>📱 Фронтенд доступен:</strong> Откройте файл warehouse-dashboard.html в браузере
                </div>
                
                <div class="info-grid">
                    <div class="info-card">
                        <strong>🌐 API URL:</strong>
                        <p>${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}</p>
                    </div>
                    <div class="info-card">
                        <strong>📡 Порт:</strong>
                        <p>${PORT}</p>
                    </div>
                    <div class="info-card">
                        <strong>🗄️ База данных:</strong>
                        <p>${mongoose.connection.db?.databaseName || 'warehouseDB'}</p>
                    </div>
                    <div class="info-card">
                        <strong>🕐 Время сервера:</strong>
                        <p>${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
                
                <h2>🚀 API Endpoints:</h2>
                
                <div class="endpoint">
                    <strong>GET /api/products</strong>
                    <p>Получить все товары</p>
                    <a href="/api/products" class="btn" target="_blank">Перейти →</a>
                    <code>curl "${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api/products"</code>
                </div>
                
                <div class="endpoint">
                    <strong>POST /api/products</strong>
                    <p>Добавить новый товар</p>
                    <code>{
    "name": "Название товара",
    "quantity": 10,
    "category": "Категория",
    "price": 1000
}</code>
                </div>
                
                <div class="endpoint">
                    <strong>PUT /api/products/:id/reduce</strong>
                    <p>Списать товар</p>
                    <code>{"quantity": 5}</code>
                </div>
                
                <div class="endpoint">
                    <strong>DELETE /api/products/:id</strong>
                    <p>Удалить товар</p>
                </div>
                
                <div class="endpoint">
                    <strong>GET /api/stats</strong>
                    <p>Получить статистику склада</p>
                    <a href="/api/stats" class="btn" target="_blank">Статистика →</a>
                </div>
                
                <h3>🎯 Инструкция:</h3>
                <ol>
                    <li>Скачайте файл <strong>warehouse-dashboard.html</strong></li>
                    <li>Откройте его в браузере (двойной клик)</li>
                    <li>Разблокируйте режим редактирования (кнопка внизу слева)</li>
                    <li>Работайте со складом через красивый интерфейс!</li>
                </ol>
            </div>
        </body>
        </html>
    `);
});

// 📦 ПОЛУЧИТЬ ВСЕ ТОВАРЫ
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        console.log(`📦 Загружено товаров из MongoDB: ${products.length}`);
        
        res.json({
            success: true,
            message: "Товары успешно загружены из базы данных",
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при загрузке товаров"
        });
    }
});

// ➕ ДОБАВИТЬ ТОВАР
app.post('/api/products', async (req, res) => {
    try {
        console.log('➕ Получен запрос на добавление товара:', req.body);
        
        const newProduct = new Product({
            name: req.body.name?.trim(),
            quantity: req.body.quantity,
            category: req.body.category?.trim() || "Разное",
            price: req.body.price || 0
        });

        const savedProduct = await newProduct.save();
        
        console.log(`✅ Товар сохранен в MongoDB! ID: ${savedProduct._id}`);
        console.log(`📊 Всего товаров в базе: ${await Product.countDocuments()}`);
        
        res.status(201).json({
            success: true,
            message: "Товар успешно добавлен в базу данных",
            data: savedProduct
        });
    } catch (error) {
        console.error('❌ Ошибка добавления товара:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при добавлении товара"
        });
    }
});

// 📉 СПИСАТЬ ТОВАР
app.put('/api/products/:id/reduce', async (req, res) => {
    try {
        const productId = req.params.id;
        const reduceBy = parseInt(req.body.quantity);
        
        console.log(`📉 Запрос на списание товара ID:${productId} на ${reduceBy} единиц`);
        
        if (!reduceBy || reduceBy <= 0) {
            return res.status(400).json({
                success: false,
                error: "Укажите корректное количество для списания"
            });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Товар не найден в базе данных"
            });
        }
        
        if (product.quantity < reduceBy) {
            return res.status(400).json({
                success: false,
                error: `Недостаточно товара. Доступно: ${product.quantity}`
            });
        }
        
        product.quantity -= reduceBy;
        product.lastUpdated = Date.now();
        await product.save();
        
        console.log(`✅ Списано ${reduceBy} единиц товара "${product.name}"`);
        console.log(`📊 Остаток в базе: ${product.quantity}`);
        
        res.json({
            success: true,
            message: `Списано ${reduceBy} единиц товара`,
            productId: productId,
            quantityReduced: reduceBy,
            newQuantity: product.quantity,
            productName: product.name
        });
    } catch (error) {
        console.error('❌ Ошибка списания товара:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при списании товара"
        });
    }
});

// ❌ УДАЛИТЬ ТОВАР
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        console.log(`❌ Запрос на удаление товара ID:${productId}`);
        
        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                error: "Товар не найден в базе данных"
            });
        }
        
        const remainingCount = await Product.countDocuments();
        
        console.log(`✅ Товар удален из MongoDB: ${deletedProduct.name}`);
        console.log(`📊 Осталось товаров в базе: ${remainingCount}`);
        
        res.json({
            success: true,
            message: "Товар удален из базы данных",
            productId: productId,
            productName: deletedProduct.name,
            remainingCount: remainingCount
        });
    } catch (error) {
        console.error('❌ Ошибка удаления товара:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при удалении товара"
        });
    }
});

// 🔍 ПОИСК ТОВАРОВ
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        console.log(`🔍 Поиск в MongoDB: "${query}"`);
        
        const results = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).sort({ name: 1 });
        
        res.json({
            success: true,
            message: `Найдено товаров: ${results.length}`,
            query: query,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при поиске"
        });
    }
});

// 📊 ПОЛУЧИТЬ СТАТИСТИКУ
app.get('/api/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalValue = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
        ]);
        
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const lowStock = await Product.countDocuments({ quantity: { $lt: 5 } });
        
        res.json({
            success: true,
            data: {
                totalProducts: totalProducts,
                totalValue: totalValue[0]?.total || 0,
                categories: categories,
                lowStock: lowStock,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при получении статистики"
        });
    }
});

// 🚀 ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 WAREHOUSE API С MONGODB ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📍 Render URL: ${process.env.RENDER_EXTERNAL_URL || 'https://warehousesystem-zljh.onrender.com'}`);
    console.log(`📍 Локальный адрес: http://localhost:${PORT}`);
    console.log(`📍 API: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api/products`);
    console.log('='.repeat(60));
    console.log(`📊 MongoDB статус: ${mongoose.connection.readyState === 1 ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА'}`);
    console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouseDB'}`);
    console.log('='.repeat(60));
    console.log('📝 ДЛЯ ОСТАНОВКИ: Ctrl + C');
    console.log('='.repeat(60));
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Критическая ошибка:', err);
});


слушай пойдет?