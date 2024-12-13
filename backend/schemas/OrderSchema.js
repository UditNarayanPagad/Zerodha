const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    name: String,
    price: Number,
    percent: String,
    isDown: Boolean,
})

module.exports = {OrderSchema}