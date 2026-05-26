const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 📦 ПОЛУЧИТЬ ВСЕ ТОВАРЫ
router.get('/', async (req, res) => {
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
        
        const inMemoryProducts = Product.getInMemory();
        if (inMemoryProducts.length > 0) {
            console.log('⚠️ Используем данные из памяти');
            return res.json({
                success: true,
                message: "Товары загружены из временного хранилища",
                count: inMemoryProducts.length,
                data: inMemoryProducts,
                isFallback: true
            });
        }
        
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при загрузке товаров"
        });
    }
});

// ➕ ДОБАВИТЬ ТОВАР
router.post('/', async (req, res) => {
    try {
        console.log('➕ Получен запрос на добавление товара:', req.body);
        
        const productData = {

    name:
        req.body.name?.trim(),

    quantity:
        req.body.quantity,

    category:
        req.body.category?.trim()
        || 'Разное',

    price:
        req.body.price || 0,


    /* ===== NEW ===== */

    description:
        req.body.description || '',

    supplier:
        req.body.supplier || '',

    location:
        req.body.location || '',

    image:
        req.body.image || '',


    /* ===== MEDICINE ===== */

    medicineSeries:
        req.body.medicineSeries || '',

    medicineManufacturer:
        req.body.medicineManufacturer || '',

    medicineDosage:
        req.body.medicineDosage || '',

    medicineType:
        req.body.medicineType || '',

    prescriptionRequired:
        req.body.prescriptionRequired || false,

    refrigerationRequired:
        req.body.refrigerationRequired || false
};
        
        if (
    req.body.expiryDate &&
    (
        req.body.category === 'Продукты' ||
        req.body.category === 'Медикаменты'
    )
) {

    productData.expiryDate =
        new Date(req.body.expiryDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (productData.expiryDate < today) {

        return res.status(400).json({

            success: false,

            error:
                "Срок годности не может быть в прошлом"
        });
    }
}
        
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        
        console.log(`✅ Товар сохранен в MongoDB! ID: ${savedProduct._id}`);
        if (savedProduct.expiryDate) {
            console.log(`📅 Срок годности: ${savedProduct.expiryDate.toISOString().split('T')[0]}`);
        }
        
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
router.put('/:id/reduce', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
        
        console.log(`✅ Товар удален из MongoDB: ${deletedProduct.name}`);
        
        res.json({
            success: true,
            message: "Товар удален из базы данных",
            productId: productId,
            productName: deletedProduct.name
        });
    } catch (error) {
        console.error('❌ Ошибка удаления товара:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера при удалении товара"
        });
    }
});

// 🆕 ПРОСРОЧЕННЫЕ ТОВАРЫ
router.get('/expired', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiredProducts = await Product.find({
            category: 'Продукты',
            expiryDate: { $lt: today, $ne: null }
        }).sort({ expiryDate: 1 });
        
        console.log(`⚠️ Найдено просроченных товаров: ${expiredProducts.length}`);
        
        res.json({
            success: true,
            count: expiredProducts.length,
            data: expiredProducts,
            message: expiredProducts.length > 0 ? 'Обнаружены просроченные товары' : 'Просроченных товаров нет'
        });
    } catch (error) {
        console.error('❌ Ошибка получения просроченных товаров:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера"
        });
    }
});

// 🔍 ПОИСК ТОВАРОВ
router.get('/search/:query', async (req, res) => {
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

// 🆕 ТОВАРЫ С ИСТЕКАЮЩИМ СРОКОМ
router.get('/expiring-soon', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);
        
        const expiringSoon = await Product.find({
            category: 'Продукты',
            expiryDate: { 
                $gte: today, 
                $lte: weekLater,
                $ne: null
            }
        }).sort({ expiryDate: 1 });
        
        console.log(`⚠️ Товаров с истекающим сроком (7 дней): ${expiringSoon.length}`);
        
        res.json({
            success: true,
            count: expiringSoon.length,
            data: expiringSoon,
            message: expiringSoon.length > 0 ? 'Есть товары с истекающим сроком годности' : 'Все сроки годности в порядке'
        });
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({
            success: false,
            error: "Ошибка сервера"
        });
    }
});

/* ===================================================== */
/* ================= UPDATE PRODUCT ==================== */
/* ===================================================== */

router.put('/:id', async (req, res) => {
    
    console.log('UPDATE ROUTE WORKS');

    try {

        const product = await Product.findById(
            req.params.id
        );

        if (!product) {

            return res.status(404).json({

                success:false,
                error:'Товар не найден'
            });
        }

        product.name = req.body.name;
        product.description = req.body.description;
        product.quantity = req.body.quantity;
        product.price = req.body.price;
        product.category = req.body.category;
        product.supplier = req.body.supplier;
        product.location = req.body.location;
        product.image = req.body.image;

        product.medicineSeries =
            req.body.medicineSeries || '';

        product.medicineManufacturer =
            req.body.medicineManufacturer || '';

        product.medicineDosage =
            req.body.medicineDosage || '';

        product.medicineType =
            req.body.medicineType || '';

        product.prescriptionRequired =
            req.body.prescriptionRequired === true;

        product.refrigerationRequired =
            req.body.refrigerationRequired === true;

        product.expiryDate =
            req.body.expiryDate || null;

        product.lastUpdated =
            new Date();

        await product.save();

        res.json({

            success:true,
            data:product
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({

            success:false,
            error:'Ошибка сервера'
        });
    }
});

module.exports = router;