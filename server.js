const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// ====================
// WAREHOUSE API WITH MONGODB
// ====================

console.log('🔧 Загрузка Warehouse API с MongoDB...');

const app = express();
const PORT = process.env.PORT || 3002; // Используем порт из переменной окружения

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB - используем переменную окружения или локальную БД
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/warehouse';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB подключена успешно');
    console.log('📊 Режим: реальная база данных');
    console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouse'}`);
})
.catch(err => {
    console.log('❌ Ошибка подключения к MongoDB:', err.message);
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

// Логгирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 📍 КОРНЕВОЙ МАРШРУТ
app.get('/', (req, res) => {
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
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Warehouse API работает с MongoDB!</h1>
                
                <div class="mongo-status ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}">
                    <strong>MongoDB статус:</strong> 
                    ${mongoose.connection.readyState === 1 ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА'}
                </div>
                
                <p><strong>Порт:</strong> ${PORT}</p>
                <p><strong>База данных:</strong> ${mongoose.connection.db?.databaseName || 'warehouse'}</p>
                <p><strong>Коллекция:</strong> products</p>
                <p><strong>Время:</strong> ${new Date().toLocaleTimeString()}</p>
                
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
                <p>Все данные теперь сохраняются в MongoDB и не теряются при перезапуске сервера.</p>
                <p>Можно открыть MongoDB Compass для просмотра данных.</p>
            </div>
        </body>
        </html>
    `);
});

// 📦 ПОЛУЧИТЬ ВСЕ ТОВАРЫ (из MongoDB)
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

// ➕ ДОБАВИТЬ ТОВАР (в MongoDB)
app.post('/api/products', async (req, res) => {
    try {
        console.log('➕ Получен запрос на добавление товара:', req.body);
        
        // Создаем новый товар
        const newProduct = new Product({
            name: req.body.name?.trim(),
            quantity: req.body.quantity,
            category: req.body.category?.trim() || "Разное",
            price: req.body.price || 0
        });

        // Сохраняем в MongoDB
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

// 📉 СПИСАТЬ ТОВАР (в MongoDB)
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
        
        // Находим товар в MongoDB
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Товар не найден в базе данных"
            });
        }
        
        // Проверяем достаточно ли товара
        if (product.quantity < reduceBy) {
            return res.status(400).json({
                success: false,
                error: `Недостаточно товара. Доступно: ${product.quantity}`
            });
        }
        
        // Обновляем количество в MongoDB
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

// ❌ УДАЛИТЬ ТОВАР (из MongoDB)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        console.log(`❌ Запрос на удаление товара ID:${productId}`);
        
        // Удаляем из MongoDB
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

// 🔍 ПОИСК ТОВАРОВ (в MongoDB)
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
        
        res.json({
            success: true,
            data: {
                totalProducts: totalProducts,
                totalValue: totalValue[0]?.total || 0,
                categories: categories,
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
    console.log(`📍 Локальный адрес: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/products`);
    console.log(`📍 Render URL: ${process.env.RENDER_EXTERNAL_URL || 'Не настроен'}`);
    console.log('='.repeat(60));
    console.log(`📊 MongoDB статус: ${mongoose.connection.readyState === 1 ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА'}`);
    console.log(`📁 База данных: ${mongoose.connection.db?.databaseName || 'warehouse'}`);
    console.log('='.repeat(60));
    console.log('📝 ДЛЯ ОСТАНОВКИ: Ctrl + C');
    console.log('='.repeat(60));
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Критическая ошибка:', err);
});