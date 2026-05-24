const mongoose = require('mongoose');

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


    /* ===================================================== */
    /* ================= NEW FIELDS ======================== */
    /* ===================================================== */

    description: {
        type: String,
        default: ''
    },

    supplier: {
        type: String,
        default: ''
    },

    location: {
        type: String,
        default: ''
    },

    image: {
        type: String,
        default: ''
    },

    /* ===================================================== */
/* ================= MEDICINE ========================== */
/* ===================================================== */

medicineSeries:{
    type:String,
    default:''
},

medicineManufacturer:{
    type:String,
    default:''
},

medicineDosage:{
    type:String,
    default:''
},

medicineType:{
    type:String,
    default:''
},

prescriptionRequired:{
    type:Boolean,
    default:false
},

refrigerationRequired:{
    type:Boolean,
    default:false
},


    /* ===================================================== */
    /* ================= EXPIRY DATE ======================= */
    /* ===================================================== */

    expiryDate: {
        type: Date,
        default: null,

        validate: {

            validator: function(value) {

                if (
                this.category !== 'Продукты' &&
                this.category !== 'Медикаменты'
)
                return true;

                if (value) {

                    const today = new Date();

                    today.setHours(0, 0, 0, 0);

                    return value >= today;
                }

                return true;
            },

            message:
                'Срок годности не может быть в прошлом'
        }
    },


    /* ===================================================== */
    /* ================= DATES ============================= */
    /* ===================================================== */

    createdAt: {
        type: Date,
        default: Date.now
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }

});


/* ===================================================== */
/* ================= INDEXES ============================ */
/* ===================================================== */

productSchema.index({ expiryDate: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 1 });


/* ===================================================== */
/* ================= MEMORY STORAGE ==================== */
/* ===================================================== */

let inMemoryProducts = [];

let nextId = 1;


/* ===================================================== */
/* ================= MEMORY METHODS ==================== */
/* ===================================================== */

productSchema.statics.getInMemory = function() {

    return inMemoryProducts;
};


productSchema.statics.addInMemory = function(product) {

    const newProduct = {

        _id: (nextId++).toString(),

        ...product,

        createdAt: new Date(),

        lastUpdated: new Date()
    };

    inMemoryProducts.unshift(newProduct);

    return newProduct;
};


productSchema.statics.updateInMemory = function(id, updates) {

    const index =

        inMemoryProducts.findIndex(
            p => p._id === id
        );

    if (index !== -1) {

        inMemoryProducts[index] = {

            ...inMemoryProducts[index],

            ...updates,

            lastUpdated: new Date()
        };

        return inMemoryProducts[index];
    }

    return null;
};


productSchema.statics.deleteInMemory = function(id) {

    const index =

        inMemoryProducts.findIndex(
            p => p._id === id
        );

    if (index !== -1) {

        inMemoryProducts.splice(index, 1);

        return true;
    }

    return false;
};


/* ===================================================== */
/* ================= MODEL ============================== */
/* ===================================================== */

const Product = mongoose.model(
    'Product',
    productSchema
);

module.exports = Product;