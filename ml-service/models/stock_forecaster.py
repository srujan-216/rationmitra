import numpy as np
from datetime import datetime, timedelta
from statsmodels.tsa.holtwinters import ExponentialSmoothing


class StockForecaster:
    """
    Stock depletion forecasting using Holt's Double Exponential Smoothing
    (additive trend, no seasonality) from statsmodels.

    Holt, C.E. (1957) — "Forecasting seasonals and trends by exponentially
    weighted moving averages", ONR Research Memorandum 52.

    Falls back to a simple OLS linear trend when fewer than MIN_SAMPLES
    outward transactions are available.
    """

    MIN_SAMPLES = 7
    FORECAST_HORIZON = 14   # days ahead for recommended reorder quantity

    def forecast(self, current_stock, stock_history, reorder_level=100):
        outward = [
            h for h in stock_history if h.get('transactionType') == 'outward'
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

        quantities = np.array([h['quantity'] for h in outward], dtype=float)
        avg_daily = float(np.mean(quantities))

        # ── Short-circuit: near-constant data is always stable ───────────
        cv = np.std(quantities) / max(abs(avg_daily), 1e-6)
        if cv < 0.05:
            forecast_vals = np.full(self.FORECAST_HORIZON, avg_daily)
            trend_label = 'stable'
            projected_daily = avg_daily
        # ── Choose forecasting method based on sample size ──────────────
        elif len(quantities) >= self.MIN_SAMPLES:
            try:
                # Holt's additive-trend double exponential smoothing
                model = ExponentialSmoothing(
                    quantities,
                    trend='add',
                    initialization_method='estimated',
                ).fit(optimized=True, disp=False)

                forecast_vals = model.forecast(self.FORECAST_HORIZON)
                forecast_vals = np.maximum(0, forecast_vals)

                # Projected near-term daily rate (next 7 days)
                projected_daily = float(np.mean(forecast_vals[:7]))

                # Trend: use absolute slope to avoid ratio instability on
                # near-constant series (where tiny fitted drift ÷ small mean
                # can exceed the 10 % threshold spuriously).
                fitted = model.fittedvalues
                x = np.arange(len(fitted), dtype=float)
                slope = np.polyfit(x, fitted, 1)[0]
                slope_pct = slope / max(abs(avg_daily), 1e-6)

                if slope_pct > 0.05:
                    trend_label = 'increasing'
                    avg_daily = projected_daily
                elif slope_pct < -0.05:
                    trend_label = 'decreasing'
                else:
                    trend_label = 'stable'

            except Exception:
                # Fallback: simple OLS slope
                x = np.arange(len(quantities))
                slope, intercept = np.polyfit(x, quantities, 1)
                projected_daily = max(0, intercept + slope * len(quantities))
                forecast_vals = np.maximum(0, [
                    intercept + slope * (len(quantities) + i)
                    for i in range(self.FORECAST_HORIZON)
                ])
                trend_label = 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
                avg_daily = projected_daily
        else:
            forecast_vals = np.full(self.FORECAST_HORIZON, avg_daily)
            trend_label = 'insufficient_data'

        # ── Depletion & urgency ──────────────────────────────────────────
        if avg_daily > 0:
            days_until_depletion = int(current_stock / avg_daily)
            depletion_date = (
                datetime.now() + timedelta(days=days_until_depletion)
            ).strftime('%Y-%m-%d')
            reorder_days = max(0, days_until_depletion - 7)
            reorder_date = (
                datetime.now() + timedelta(days=reorder_days)
            ).strftime('%Y-%m-%d')

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

        recommended_reorder = round(float(np.sum(forecast_vals[:self.FORECAST_HORIZON])))

        return {
            'currentStock': current_stock,
            'avgDailyConsumption': round(avg_daily, 1),
            'daysUntilDepletion': days_until_depletion,
            'depletionDate': depletion_date,
            'reorderDate': reorder_date,
            'reorderUrgency': urgency,
            'recommendedReorder': recommended_reorder,
            'trend': trend_label,
            'isLowStock': current_stock <= reorder_level,
        }


stock_forecaster = StockForecaster()
