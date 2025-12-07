const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// ====================
// WAREHOUSE API WITH MONGODB ATLAS
// ====================

console.log('🔧 Загрузка Warehouse API с MongoDB Atlas...');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;

// Функция для определения, доступна ли MongoDB
function isMongoDBConnected() {
    return mongoose.connection.readyState === 1; // 1 = подключено
}

// Подключение к MongoDB
if (mongoURI) {
    console.log('🔌 Подключение к MongoDB Atlas...');
    
    // САМЫЙ ПРОСТОЙ ВАРИАНТ
    mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ MongoDB Atlas подключена!');
        console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouse'}`);
        console.log(`📍 Хост: ${mongoose.connection.host}`);
        console.log('📊 Режим: облачная база данных');
    })
    .catch(err => {
        console.log('❌ Ошибка подключения к MongoDB Atlas:');
        console.log(`   Сообщение: ${err.message}`);
        console.log('⚠️  Проверьте:');
        console.log('   1. Строку подключения MONGODB_URI в Render');
        console.log('   2. IP адрес в MongoDB Atlas Network Access (0.0.0.0/0)');
        console.log('   3. Имя пользователя и пароль в Atlas');
        console.log('📝 Переходим в режим работы с данными в памяти');
    });
} else {
    console.log('⚠️  MONGODB_URI не настроена, работаем в памяти');
}

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

// Массив для хранения товаров в памяти (если MongoDB недоступна)
let inMemoryProducts = [];
let nextId = 1;

// Логгирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 📍 КОРНЕВОЙ МАРШРУТ
app.get('/', (req, res) => {
    const mongoStatus = isMongoDBConnected() ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА';
    const mongoStatusClass = isMongoDBConnected() ? 'connected' : 'disconnected';
    const dbName = isMongoDBConnected() ? (mongoose.connection.db?.databaseName || 'warehouse') : 'Память';
    const mongoURIInfo = process.env.MONGODB_URI ? 'Настроена' : 'Не настроена';
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>📦 Warehouse API с MongoDB Atlas</title>
            <style>
                body { font-family: Arial; padding: 40px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; max-width: 800px; margin: 0 auto; }
                h1 { color: #27ae60; }
                .mongo-status { padding: 10px; border-radius: 5px; margin: 10px 0; }
                .connected { background: #d4edda; color: #155724; }
                .disconnected { background: #f8d7da; color: #721c24; }
                .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
                code { background: #2c3e50; color: white; padding: 2px 6px; border-radius: 3px; }
                .info-box { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .status-info { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Warehouse API работает!</h1>
                
                <div class="mongo-status ${mongoStatusClass}">
                    <strong>MongoDB Atlas статус:</strong> ${mongoStatus}
                </div>
                
                <div class="status-info">
                    <p><strong>🔧 Конфигурация:</strong></p>
                    <p><strong>MONGODB_URI:</strong> ${mongoURIInfo}</p>
                    <p><strong>Режим работы:</strong> ${isMongoDBConnected() ? 'Облачная база' : 'Локальная память'}</p>
                </div>
                
                <div class="info-box">
                    <p><strong>🌐 Ссылка:</strong> <a href="${process.env.RENDER_EXTERNAL_URL || '#'}" target="_blank">${process.env.RENDER_EXTERNAL_URL || 'Не настроен'}</a></p>
                    <p><strong>📡 Порт:</strong> ${PORT}</p>
                    <p><strong>🗄️ База данных:</strong> ${dbName}</p>
                    <p><strong>📦 Коллекция:</strong> products</p>
                    <p><strong>🕐 Время:</strong> ${new Date().toLocaleTimeString()}</p>
                </div>
                
                <h2>📡 API Endpoints:</h2>
                
                <div class="endpoint">
                    <strong>GET /api/products</strong>
                    <p>Получить все товары</p>
                    <p><a href="/api/products" target="_blank">Перейти →</a></p>
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
                
                <h3>📊 Информация:</h3>
                <p>API автоматически использует MongoDB Atlas при доступности, или работает с данными в памяти.</p>
                <p>Для настройки MongoDB Atlas проверьте переменную MONGODB_URI в Render.</p>
            </div>
        </body>
        </html>
    `);
});

// 📦 ПОЛУЧИТЬ ВСЕ ТОВАРЫ
app.get('/api/products', async (req, res) => {
    try {
        if (isMongoDBConnected()) {
            // Используем MongoDB
            const products = await Product.find().sort({ createdAt: -1 });
            console.log(`📦 Загружено товаров из MongoDB Atlas: ${products.length}`);
            
            res.json({
                success: true,
                message: "Товары успешно загружены из MongoDB Atlas",
                count: products.length,
                data: products,
                source: "mongodb"
            });
        } else {
            // Используем память
            console.log(`📦 Загружено товаров из памяти: ${inMemoryProducts.length}`);
            
            res.json({
                success: true,
                message: "Товары успешно загружены (режим памяти)",
                count: inMemoryProducts.length,
                data: inMemoryProducts,
                source: "memory"
            });
        }
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
        
        const newProductData = {
            name: req.body.name?.trim(),
            quantity: req.body.quantity,
            category: req.body.category?.trim() || "Разное",
            price: req.body.price || 0,
            createdAt: new Date(),
            lastUpdated: new Date()
        };
        
        if (isMongoDBConnected()) {
            // Используем MongoDB
            const newProduct = new Product(newProductData);
            const savedProduct = await newProduct.save();
            
            console.log(`✅ Товар сохранен в MongoDB Atlas! ID: ${savedProduct._id}`);
            console.log(`📊 Всего товаров в базе: ${await Product.countDocuments()}`);
            
            res.status(201).json({
                success: true,
                message: "Товар успешно добавлен в MongoDB Atlas",
                data: savedProduct,
                source: "mongodb"
            });
        } else {
            // Используем память
            const newProduct = {
                ...newProductData,
                _id: nextId++
            };
            
            inMemoryProducts.push(newProduct);
            console.log(`✅ Товар сохранен в памяти! ID: ${newProduct._id}`);
            console.log(`📊 Всего товаров в памяти: ${inMemoryProducts.length}`);
            
            res.status(201).json({
                success: true,
                message: "Товар успешно добавлен (режим памяти)",
                data: newProduct,
                source: "memory"
            });
        }
    } catch (error) {
        console.error('❌ Ошибка добавления товара:', error);
        
        // Проверяем ошибки валидации MongoDB
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
        
        if (isMongoDBConnected()) {
            // Используем MongoDB
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
            
            console.log(`✅ Списано ${reduceBy} единиц товара "${product.name}" из MongoDB`);
            
            res.json({
                success: true,
                message: `Списано ${reduceBy} единиц товара`,
                productId: productId,
                quantityReduced: reduceBy,
                newQuantity: product.quantity,
                productName: product.name,
                source: "mongodb"
            });
        } else {
            // Используем память
            const productIndex = inMemoryProducts.findIndex(p => p._id == productId);
            
            if (productIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: "Товар не найден"
                });
            }
            
            const product = inMemoryProducts[productIndex];
            
            if (product.quantity < reduceBy) {
                return res.status(400).json({
                    success: false,
                    error: `Недостаточно товара. Доступно: ${product.quantity}`
                });
            }
            
            product.quantity -= reduceBy;
            product.lastUpdated = new Date();
            
            console.log(`✅ Списано ${reduceBy} единиц товара "${product.name}" из памяти`);
            
            res.json({
                success: true,
                message: `Списано ${reduceBy} единиц товара`,
                productId: productId,
                quantityReduced: reduceBy,
                newQuantity: product.quantity,
                productName: product.name,
                source: "memory"
            });
        }
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
        
        if (isMongoDBConnected()) {
            // Используем MongoDB
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
                remainingCount: remainingCount,
                source: "mongodb"
            });
        } else {
            // Используем память
            const productIndex = inMemoryProducts.findIndex(p => p._id == productId);
            
            if (productIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: "Товар не найден"
                });
            }
            
            const deletedProduct = inMemoryProducts.splice(productIndex, 1)[0];
            const remainingCount = inMemoryProducts.length;
            
            console.log(`✅ Товар удален из памяти: ${deletedProduct.name}`);
            console.log(`📊 Осталось товаров в памяти: ${remainingCount}`);
            
            res.json({
                success: true,
                message: "Товар удален (режим памяти)",
                productId: productId,
                productName: deletedProduct.name,
                remainingCount: remainingCount,
                source: "memory"
            });
        }
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
        console.log(`🔍 Поиск: "${query}"`);
        
        if (isMongoDBConnected()) {
            // Используем MongoDB
            const results = await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            }).sort({ name: 1 });
            
            res.json({
                success: true,
                message: `Найдено товаров в MongoDB: ${results.length}`,
                query: query,
                count: results.length,
                data: results,
                source: "mongodb"
            });
        } else {
            // Используем память
            const results = inMemoryProducts.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.category.toLowerCase().includes(query)
            );
            
            res.json({
                success: true,
                message: `Найдено товаров в памяти: ${results.length}`,
                query: query,
                count: results.length,
                data: results,
                source: "memory"
            });
        }
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
        if (isMongoDBConnected()) {
            // Используем MongoDB
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
                data: {
                    totalProducts: totalProducts,
                    totalValue: totalValue[0]?.total || 0,
                    categories: categories,
                    lastUpdated: new Date().toISOString(),
                    source: "mongodb"
                }
            });
        } else {
            // Используем память
            const totalProducts = inMemoryProducts.length;
            const totalValue = inMemoryProducts.reduce((sum, product) => sum + (product.quantity * product.price), 0);
            
            const categories = {};
            inMemoryProducts.forEach(product => {
                categories[product.category] = (categories[product.category] || 0) + 1;
            });
            
            const categoriesArray = Object.entries(categories).map(([name, count]) => ({ _id: name, count }));
            categoriesArray.sort((a, b) => b.count - a.count);
            
            res.json({
                success: true,
                data: {
                    totalProducts: totalProducts,
                    totalValue: totalValue,
                    categories: categoriesArray,
                    lastUpdated: new Date().toISOString(),
                    source: "memory"
                }
            });
        }
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
    console.log('🚀 WAREHOUSE API ЗАПУЩЕН НА RENDER!');
    console.log('='.repeat(60));
    console.log(`📍 Render URL: ${process.env.RENDER_EXTERNAL_URL || 'https://warehousesystem-zljh.onrender.com'}`);
    console.log(`📍 Локальный порт: ${PORT}`);
    console.log(`📍 API Endpoint: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}/api/products`);
    console.log('='.repeat(60));
    console.log(`📊 MongoDB статус: ${isMongoDBConnected() ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА'}`);
    console.log(`📁 База данных: ${isMongoDBConnected() ? (mongoose.connection.db?.databaseName || 'warehouse') : 'Память'}`);
    console.log(`🔗 MONGODB_URI: ${process.env.MONGODB_URI ? 'Настроена' : 'Не настроена'}`);
    console.log('='.repeat(60));
    console.log('📝 ДЛЯ ОСТАНОВКИ: Ctrl + C');
    console.log('='.repeat(60));
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Критическая ошибка:', err);
});