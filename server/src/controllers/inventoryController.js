const Inventory = require('../models/Inventory');

exports.getShopInventory = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const inventory = await Inventory.find({ shopId });
    res.json({ inventory });
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { shopId, itemName, quantity, transactionType, unit, remarks } = req.body;

    let item = await Inventory.findOne({ shopId, itemName });
    if (!item) {
      item = new Inventory({ shopId, itemName, currentStock: 0, unit: unit || 'kg' });
    }

    if (transactionType === 'inward') {
      item.currentStock += quantity;
    } else if (transactionType === 'outward') {
      if (item.currentStock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      item.currentStock -= quantity;
    }

    item.stockHistory.push({ quantity, transactionType, remarks });
    item.lastStockUpdate = new Date();
    item.isLowStock = item.currentStock <= item.reorderLevel;
    await item.save();

    res.json({ message: 'Stock updated', item });
  } catch (error) {
    next(error);
  }
};

exports.setReorderLevel = async (req, res, next) => {
  try {
    const { shopId, itemName, reorderLevel, reorderQuantity } = req.body;
    const item = await Inventory.findOneAndUpdate(
      { shopId, itemName },
      { reorderLevel, reorderQuantity },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Reorder level updated', item });
  } catch (error) {
    next(error);
  }
};

exports.getStockForecast = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const inventory = await Inventory.find({ shopId });

    const forecasts = inventory.map((item) => {
      const recentOutward = item.stockHistory
        .filter((h) => h.transactionType === 'outward')
        .slice(-30);
      const avgDailyConsumption =
        recentOutward.length > 0
          ? recentOutward.reduce((sum, h) => sum + h.quantity, 0) / Math.max(recentOutward.length, 1)
          : 0;
      const daysUntilDepletion =
        avgDailyConsumption > 0 ? Math.floor(item.currentStock / avgDailyConsumption) : null;

      return {
        itemName: item.itemName,
        currentStock: item.currentStock,
        unit: item.unit,
        avgDailyConsumption: Math.round(avgDailyConsumption * 10) / 10,
        daysUntilDepletion,
        isLowStock: item.isLowStock,
        reorderLevel: item.reorderLevel,
      };
    });

    res.json({ shopId, forecasts });
  } catch (error) {
    next(error);
  }
};
