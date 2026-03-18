import numpy as np
from datetime import datetime, timedelta


class StockForecaster:
    """Predicts stock depletion dates and recommends reorder quantities."""

    def forecast(self, current_stock, stock_history, reorder_level=100):
        """
        Forecast depletion date based on consumption history.

        Args:
            current_stock: Current stock quantity
            stock_history: list of dicts with keys: timestamp, quantity, transactionType
            reorder_level: Threshold to trigger reorder alert

        Returns:
            dict with forecast details
        """
        outward = [
            h for h in stock_history
            if h.get('transactionType') == 'outward'
        ]

        if not outward:
            return {
                'currentStock': current_stock,
                'avgDailyConsumption': 0,
                'daysUntilDepletion': None,
                'depletionDate': None,
                'reorderDate': None,
                'reorderUrgency': 'unknown',
                'recommendedReorder': 0,
                'trend': 'insufficient_data',
                'isLowStock': current_stock <= reorder_level,
            }

        # Calculate daily consumption rate
        quantities = [h['quantity'] for h in outward]
        avg_daily = np.mean(quantities) if quantities else 0

        # Trend: increasing or decreasing consumption
        if len(quantities) >= 7:
            recent = np.mean(quantities[-7:])
            older = np.mean(quantities[:-7]) if len(quantities) > 7 else avg_daily
            if recent > older * 1.1:
                trend = 'increasing'
                avg_daily = recent  # Use recent trend for prediction
            elif recent < older * 0.9:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'

        # Calculate depletion
        if avg_daily > 0:
            days_until_depletion = int(current_stock / avg_daily)
            depletion_date = (datetime.now() + timedelta(days=days_until_depletion)).strftime('%Y-%m-%d')

            # Reorder date (7 days before depletion for buffer)
            reorder_days = max(0, days_until_depletion - 7)
            reorder_date = (datetime.now() + timedelta(days=reorder_days)).strftime('%Y-%m-%d')

            # Urgency
            if days_until_depletion <= 3:
                urgency = 'critical'
            elif days_until_depletion <= 7:
                urgency = 'high'
            elif days_until_depletion <= 14:
                urgency = 'medium'
            else:
                urgency = 'low'
        else:
            days_until_depletion = None
            depletion_date = None
            reorder_date = None
            urgency = 'unknown'

        # Recommended reorder quantity (14-day supply)
        recommended_reorder = round(avg_daily * 14) if avg_daily > 0 else 0

        return {
            'currentStock': current_stock,
            'avgDailyConsumption': round(avg_daily, 1),
            'daysUntilDepletion': days_until_depletion,
            'depletionDate': depletion_date,
            'reorderDate': reorder_date,
            'reorderUrgency': urgency,
            'recommendedReorder': recommended_reorder,
            'trend': trend,
            'isLowStock': current_stock <= reorder_level,
        }


# Singleton
stock_forecaster = StockForecaster()
