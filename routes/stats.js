const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 📊 ПОЛУЧИТЬ СТАТИСТИКУ
router.get('/', async (req, res) => {
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
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);
        
        const expiredCount = await Product.countDocuments({
            category: 'Продукты',
            expiryDate: { $lt: today, $ne: null }
        });
        
        const expiringSoonCount = await Product.countDocuments({
            category: 'Продукты',
            expiryDate: { $gte: today, $lte: weekLater, $ne: null }
        });
        
        res.json({
            success: true,
            data: {
                totalProducts: totalProducts,
                totalValue: totalValue[0]?.total || 0,
                categories: categories,
                lowStock: lowStock,
                expiredProducts: expiredCount,
                expiringSoonProducts: expiringSoonCount,
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

module.exports = router;