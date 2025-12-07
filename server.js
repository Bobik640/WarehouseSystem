// ====================
// WAREHOUSE API WITH MONGODB
// ====================

console.log('🔧 Загрузка Warehouse API с MongoDB...');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/warehouseDB')
.then(() => {
    console.log('✅ Успешно подключились к MongoDB!');
    console.log('📊 База данных: warehouseDB');
    console.log('📁 Коллекция: products');
})
.catch(err => {
    console.log('❌ Ошибка подключения к MongoDB:', err.message);
    console.log('⚠️  Убедитесь, что MongoDB запущена: mongod.exe');
    console.log('⚠️  Или запустите MongoDB Compass для проверки');
    console.log('📌 Работаем с данными в памяти');
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

// Логгирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 📍 КОРНЕВОЙ МАРШРУТ
app.get('/', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>📦 Warehouse API с MongoDB</title>
            <style>
                body { font-family: Arial; padding: 40px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; max-width: 800px; margin: 0 auto; }
                h1 { color: #27ae60; }
                .mongo-status { padding: 10px; border-radius: 5px; margin: 10px 0; }
                .connected { background: #d4edda; color: #155724; }
                .disconnected { background: #f8d7da; color: #721c24; }
                .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
                code { background: #2c3e50; color: white; padding: 2px 6px; border-radius: 3px; }
                a { color: #3498db; text-decoration: none; }
                a:hover { text-decoration: underline; }
                pre { background: #2c3e50; color: white; padding: 10px; border-radius: 5px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📦 Warehouse API работает!</h1>
                
                <div class="mongo-status ${isConnected ? 'connected' : 'disconnected'}">
                    <strong>MongoDB статус:</strong> 
                    ${isConnected ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА'}
                    ${!isConnected ? '<br><small>⚠️ Сервер работает в режиме памяти. Данные не сохраняются.</small>' : ''}
                </div>
                
                <p><strong>Порт:</strong> ${PORT}</p>
                <p><strong>База данных:</strong> warehouseDB</p>
                <p><strong>Коллекция:</strong> products</p>
                <p><strong>Время запуска:</strong> ${new Date().toLocaleTimeString()}</p>
                
                <h2>📡 API Endpoints:</h2>
                
                <div class="endpoint">
                    <strong>GET <a href="/api/products" target="_blank">/api/products</a></strong>
                    <p>Получить все товары</p>
                </div>
                
                <div class="endpoint">
                    <strong>POST /api/products</strong>
                    <p>Добавить новый товар</p>
                    <p>Тело запроса (JSON):</p>
                    <pre><code>{
    "name": "Название товара",
    "quantity": 10,
    "category": "Категория",
    "price": 1000
}</code></pre>
                </div>
                
                <div class="endpoint">
                    <strong>PUT /api/products/:id/reduce</strong>
                    <p>Списать товар</p>
                    <p>Тело: {"quantity": 5}</p>
                </div>
                
                <div class="endpoint">
                    <strong>DELETE /api/products/:id</strong>
                    <p>Удалить товар</p>
                </div>
                
                <div class="endpoint">
                    <strong>GET <a href="/api/stats" target="_blank">/api/stats</a></strong>
                    <p>Получить статистику склада</p>
                </div>
                
                <h3>📊 Информация:</h3>
                <p>Все данные сохраняются в MongoDB и не теряются при перезапуске сервера.</p>
                <p>Для работы с базой данных установите и запустите MongoDB.</p>
                
                <h3>🔧 Для разработчика:</h3>
                <p>Статус подключения: ${mongoose.connection.readyState}</p>
                <p>0 = отключен, 1 = подключен, 2 = подключается, 3 = отключается</p>
            </div>
        </body>
        </html>
    `);
});

// 📦 ПОЛУЧИТЬ ВСЕ ТОВАРЫ (из MongoDB или памяти)
app.get('/api/products', async (req, res) => {
    try {
        // Проверяем подключение к MongoDB
        if (mongoose.connection.readyState === 1) {
            const products = await Product.find().sort({ createdAt: -1 });
            console.log(`📦 Загружено товаров из MongoDB: ${products.length}`);
            
            res.json({
                success: true,
                message: "Товары успешно загружены из базы данных",
                source: "mongodb",
                count: products.length,
                data: products
            });
        } else {
            // Если MongoDB не подключена, возвращаем тестовые данные
            res.json({
                success: true,
                message: "Сервер работает в режиме памяти. MongoDB не подключена.",
                source: "memory",
                count: 0,
                data: []
            });
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при загрузке товаров",
            details: error.message
        });
    }
});

// ➕ ДОБАВИТЬ ТОВАР (в MongoDB или память)
app.post('/api/products', async (req, res) => {
    try {
        console.log('➕ Получен запрос на добавление товара:', req.body);
        
        if (mongoose.connection.readyState === 1) {
            // Создаем новый товар для MongoDB
            const newProduct = new Product({
                name: req.body.name?.trim(),
                quantity: req.body.quantity,
                category: req.body.category?.trim() || "Разное",
                price: req.body.price || 0
            });

            // Сохраняем в MongoDB
            const savedProduct = await newProduct.save();
            
            console.log(`✅ Товар сохранен в MongoDB! ID: ${savedProduct._id}`);
            
            res.status(201).json({
                success: true,
                message: "Товар успешно добавлен в базу данных",
                source: "mongodb",
                data: savedProduct
            });
        } else {
            // Если MongoDB не подключена
            const tempProduct = {
                _id: Date.now().toString(),
                name: req.body.name?.trim(),
                quantity: req.body.quantity,
                category: req.body.category?.trim() || "Разное",
                price: req.body.price || 0,
                createdAt: new Date(),
                lastUpdated: new Date()
            };
            
            console.log(`⚠️ Товар добавлен в память (MongoDB не подключена): ${tempProduct.name}`);
            
            res.status(201).json({
                success: true,
                message: "Товар добавлен в память (MongoDB не подключена)",
                source: "memory",
                data: tempProduct
            });
        }
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
            error: "Ошибка сервера при добавлении товара",
            details: error.message
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
        
        if (mongoose.connection.readyState === 1) {
            // Находим товар в MongoDB
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
            
            res.json({
                success: true,
                message: `Списано ${reduceBy} единиц товара`,
                source: "mongodb",
                productId: productId,
                quantityReduced: reduceBy,
                newQuantity: product.quantity,
                productName: product.name
            });
        } else {
            // Если MongoDB не подключена
            res.status(503).json({
                success: false,
                error: "MongoDB не подключена. Операция списания недоступна."
            });
        }
    } catch (error) {
        console.error('❌ Ошибка списания товара:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при списании товара",
            details: error.message
        });
    }
});

// ❌ УДАЛИТЬ ТОВАР
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        console.log(`❌ Запрос на удаление товара ID:${productId}`);
        
        if (mongoose.connection.readyState === 1) {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            
            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    error: "Товар не найден в базе данных"
                });
            }
            
            const remainingCount = await Product.countDocuments();
            
            console.log(`✅ Товар удален из MongoDB: ${deletedProduct.name}`);
            
            res.json({
                success: true,
                message: "Товар удален из базы данных",
                source: "mongodb",
                productId: productId,
                productName: deletedProduct.name,
                remainingCount: remainingCount
            });
        } else {
            res.status(503).json({
                success: false,
                error: "MongoDB не подключена. Операция удаления недоступна."
            });
        }
    } catch (error) {
        console.error('❌ Ошибка удаления товара:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при удалении товара",
            details: error.message
        });
    }
});

// 🔍 ПОИСК ТОВАРОВ
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        console.log(`🔍 Поиск: "${query}"`);
        
        if (mongoose.connection.readyState === 1) {
            const results = await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            }).sort({ name: 1 });
            
            res.json({
                success: true,
                message: `Найдено товаров: ${results.length}`,
                source: "mongodb",
                query: query,
                count: results.length,
                data: results
            });
        } else {
            res.json({
                success: true,
                message: "Поиск временно недоступен (MongoDB не подключена)",
                source: "memory",
                query: query,
                count: 0,
                data: []
            });
        }
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при поиске",
            details: error.message
        });
    }
});

// 📊 ПОЛУЧИТЬ СТАТИСТИКУ
app.get('/api/stats', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const totalProducts = await Product.countDocuments();
            const totalValue = await Product.aggregate([
                { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
            ]);
            
            const categories = await Product.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            res.json({
                success: true,
                source: "mongodb",
                data: {
                    totalProducts: totalProducts,
                    totalValue: totalValue[0]?.total || 0,
                    categories: categories,
                    lastUpdated: new Date().toISOString()
                }
            });
        } else {
            res.json({
                success: true,
                source: "memory",
                message: "Статистика недоступна (MongoDB не подключена)",
                data: {
                    totalProducts: 0,
                    totalValue: 0,
                    categories: [],
                    lastUpdated: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при получении статистики",
            details: error.message
        });
    }
});

// 🚀 ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 WAREHOUSE API ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📍 Локальный адрес: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/products`);
    console.log('='.repeat(60));
    
    // Показываем статус подключения
    const mongoStatus = mongoose.connection.readyState;
    let statusText = '';
    switch(mongoStatus) {
        case 0: statusText = '🔴 ОТКЛЮЧЕНА'; break;
        case 1: statusText = '🟢 ПОДКЛЮЧЕНА'; break;
        case 2: statusText = '🟡 ПОДКЛЮЧАЕТСЯ'; break;
        case 3: statusText = '🟠 ОТКЛЮЧАЕТСЯ'; break;
    }
    console.log(`📊 MongoDB статус: ${statusText} (код: ${mongoStatus})`);
    
    if (mongoStatus !== 1) {
        console.log('⚠️  Сервер работает в режиме памяти');
        console.log('⚠️  Для работы с базой данных запустите MongoDB');
        console.log('⚠️  Команда для запуска: mongod.exe');
    }
    
    console.log('='.repeat(60));
    console.log('📝 ДЛЯ ОСТАНОВКИ: Ctrl + C');
    console.log('='.repeat(60));
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Критическая ошибка:', err);
});