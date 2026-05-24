const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 📍 API ДОКУМЕНТАЦИЯ
router.get('/', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? '🟢 ПОДКЛЮЧЕНА' : '🔴 ОТКЛЮЧЕНА';
    const mongoStatusClass = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const PORT = process.env.PORT || 3002;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>📦 Warehouse API с MongoDB Atlas</title>
            <style>
                body { font-family: Arial; padding: 40px; background: linear-gradient(135deg, #667eea, #764ba2); min-height: 100vh; margin: 0; }
                .container { background: white; padding: 40px; border-radius: 20px; max-width: 900px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                h1 { color: #27ae60; text-align: center; margin-bottom: 30px; font-size: 2.5rem; }
                .status-container { text-align: center; margin: 30px 0; }
                .mongo-status { padding: 15px; border-radius: 10px; display: inline-block; font-size: 1.2rem; font-weight: bold; }
                .connected { background: #d4edda; color: #155724; border: 3px solid #c3e6cb; }
                .disconnected { background: #f8d7da; color: #721c24; border: 3px solid #f5c6cb; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .info-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #3498db; }
                .endpoint { background: #f1f5f9; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #e2e8f0; }
                code { background: #2c3e50; color: white; padding: 8px 12px; border-radius: 6px; display: block; margin: 10px 0; font-family: monospace; white-space: pre-wrap; }
                .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 5px; font-weight: bold; }
                .btn:hover { background: #5a67d8; }
                .alert { background: #fff3cd; border: 2px solid #ffeaa7; padding: 15px; border-radius: 10px; margin: 20px 0; }
                .feature-badge { background: #27ae60; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏭 Warehouse Management API <span class="feature-badge">v2.0</span></h1>
                
                <div class="status-container">
                    <div class="mongo-status ${mongoStatusClass}">
                        <strong>MongoDB Atlas статус:</strong> ${mongoStatus}
                    </div>
                </div>
                
                <div class="alert">
                    <strong>✨ НОВАЯ ФУНКЦИЯ:</strong> Добавлена поддержка срока годности для категории "Продукты"!
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
                    <p>Получить все товары (включая срок годности)</p>
                    <a href="/api/products" class="btn" target="_blank">Перейти →</a>
                    <code>curl "${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api/products"</code>
                </div>
                
                <div class="endpoint">
                    <strong>POST /api/products</strong>
                    <p>Добавить новый товар (с поддержкой срока годности)</p>
                    <code>{
    "name": "Название товара",
    "quantity": 10,
    "category": "Продукты",
    "price": 1000,
    "expiryDate": "2025-12-31"
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
                
                <div class="endpoint">
                    <strong>GET /api/products/expired</strong>
                    <p>Получить просроченные товары</p>
                    <a href="/api/products/expired" class="btn" target="_blank">Просроченные →</a>
                </div>
                
                <div class="endpoint">
                    <strong>GET /api/products/expiring-soon</strong>
                    <p>Получить товары с истекающим сроком (менее 7 дней)</p>
                    <a href="/api/products/expiring-soon" class="btn" target="_blank">Истекают скоро →</a>
                </div>
                
                <div class="endpoint">
                    <strong>GET /</strong>
                    <p>Главная страница с панелью управления складом</p>
                    <a href="/" class="btn" target="_blank">Открыть панель →</a>
                </div>
                
                <h3>🎯 Инструкция:</h3>
                <ol>
                    <li>Откройте <a href="/">главную страницу</a> с панелью управления складом</li>
                    <li>Войдите в систему (логин: vladik, пароль: rdwx174291)</li>
                    <li>При выборе категории "Продукты" появится поле "Срок годности"</li>
                    <li>Добавляйте товары и следите за сроками годности!</li>
                </ol>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;