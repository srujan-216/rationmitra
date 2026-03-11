const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
  transactionType: { type: String, enum: ['inward', 'outward'], required: true },
  remarks: { type: String },
});

const inventorySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    itemName: { type: String, required: true, trim: true },
    currentStock: { type: Number, required: true, default: 0 },
    unit: { type: String, enum: ['kg', 'liter', 'piece'], default: 'kg' },
    reorderLevel: { type: Number, default: 100 },
    reorderQuantity: { type: Number, default: 500 },
    lastStockUpdate: { type: Date, default: Date.now },
    stockHistory: [stockHistorySchema],
    lastForecastedDepletionDate: { type: Date },
    isLowStock: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.index({ shopId: 1, itemName: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
