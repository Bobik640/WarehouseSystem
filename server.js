const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

// ====================
// WAREHOUSE API WITH MONGODB ATLAS
// ====================

console.log("🔧 Загрузка Warehouse API с MongoDB Atlas...");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;

// Функция проверки подключения
function isMongoDBConnected() {
    return mongoose.connection.readyState === 1;
}

// ===================
// СХЕМА
// ===================
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, default: "Разное", trim: true },
    price: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

let Product = null;

// =======================
// КОННЕКТ К БАЗЕ
// =======================

if (mongoURI) {
    console.log("🔌 Подключение к MongoDB Atlas...");

    mongoose
        .connect(mongoURI)
        .then(() => {
            console.log("✅ MongoDB Atlas подключена!");
            Product = mongoose.model("Product", productSchema);
        })
        .catch((err) => {
            console.log("❌ Ошибка подключения к MongoDB Atlas:");
            console.log("   " + err.message);
            console.log("⚠ Используем режим памяти");
        });

} else {
    console.log("⚠ MONGODB_URI не настроена — работаем в памяти");
}

// ======================
// ХРАНЕНИЕ В ПАМЯТИ
// ======================
let inMemoryProducts = [];
let nextId = 1;

// =====================
// LOG
// =====================
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// =====================
// ROOT PAGE
// =====================
app.get("/", (req, res) => {
    const mongoStatus = isMongoDBConnected() ? "🟢 ПОДКЛЮЧЕНА" : "🔴 ОТКЛЮЧЕНА";
    res.send(`
        <h1>Warehouse API работает!</h1>
        <p>MongoDB Atlas статус: <strong>${mongoStatus}</strong></p>
        <p><a href="/api/products">📦 /api/products</a></p>
    `);
});

// =====================
// API ROUTES
// =====================

// GET PRODUCTS
app.get("/api/products", async (req, res) => {
    try {
        if (isMongoDBConnected() && Product) {
            const products = await Product.find().sort({ createdAt: -1 });
            return res.json({
                success: true,
                count: products.length,
                data: products,
                source: "mongodb"
            });
        } else {
            return res.json({
                success: true,
                count: inMemoryProducts.length,
                data: inMemoryProducts,
                source: "memory"
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Ошибка сервера" });
    }
});

// POST NEW PRODUCT
app.post("/api/products", async (req, res) => {
    try {
        const newProductData = {
            name: req.body.name?.trim(),
            quantity: req.body.quantity,
            category: req.body.category?.trim() || "Разное",
            price: req.body.price || 0
        };

        if (isMongoDBConnected() && Product) {
            const newProduct = new Product(newProductData);
            const saved = await newProduct.save();

            return res.status(201).json({
                success: true,
                data: saved,
                source: "mongodb"
            });
        } else {
            const newProduct = { ...newProductData, _id: nextId++ };
            inMemoryProducts.push(newProduct);

            return res.status(201).json({
                success: true,
                data: newProduct,
                source: "memory"
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {
    try {
        if (isMongoDBConnected() && Product) {
            const deleted = await Product.findByIdAndDelete(req.params.id);
            if (!deleted)
                return res.status(404).json({ success: false, error: "Не найден" });

            return res.json({ success: true, deleted, source: "mongodb" });
        } else {
            const idx = inMemoryProducts.findIndex((p) => p._id == req.params.id);
            if (idx === -1)
                return res.status(404).json({ success: false, error: "Не найден" });

            const deleted = inMemoryProducts.splice(idx, 1)[0];
            return res.json({ success: true, deleted, source: "memory" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Ошибка сервера" });
    }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
    console.log("=============================================");
    console.log("🚀 WAREHOUSE API ЗАПУЩЕН НА RENDER!");
    console.log("=============================================");
    console.log(`📍 URL: ${process.env.RENDER_EXTERNAL_URL || "http://localhost:" + PORT}`);
    console.log(`📡 Порт: ${PORT}`);
    console.log("=============================================");
});