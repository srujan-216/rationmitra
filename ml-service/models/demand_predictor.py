import numpy as np
import pandas as pd
from datetime import datetime, timedelta


class DemandPredictor:
    """Time-series demand forecasting using weighted moving average with seasonal adjustments."""

    def __init__(self):
        self.trained = False
        self.day_of_week_factors = np.ones(7)
        self.base_demand = 40
        self.history = []

    def train(self, historical_data):
        """
        Train on historical queue data.
        historical_data: list of dicts with keys: date, footfall
        """
        if not historical_data or len(historical_data) < 7:
            return

        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.dayofweek

        self.base_demand = df['footfall'].mean()
        self.history = df['footfall'].tolist()

        # Calculate day-of-week seasonal factors
        for day in range(7):
            day_data = df[df['day_of_week'] == day]['footfall']
            if len(day_data) > 0:
                self.day_of_week_factors[day] = day_data.mean() / max(self.base_demand, 1)

        self.trained = True

    def predict(self, target_date, num_days=1):
        """Predict footfall for target_date (and optionally next num_days)."""
        predictions = []
        target = datetime.strptime(target_date, '%Y-%m-%d') if isinstance(target_date, str) else target_date

        for i in range(num_days):
            pred_date = target + timedelta(days=i)
            day_of_week = pred_date.weekday()

            # Weighted moving average of recent history
            if len(self.history) >= 7:
                weights = np.exp(np.linspace(-1, 0, min(len(self.history), 30)))
                recent = self.history[-30:]
                weights = weights[-len(recent):]
                wma = np.average(recent, weights=weights)
            else:
                wma = self.base_demand

            # Apply day-of-week seasonal factor
            predicted = wma * self.day_of_week_factors[day_of_week]

            # Add slight randomness for confidence interval
            noise_std = max(predicted * 0.15, 3)
            lower = max(0, round(predicted - 1.96 * noise_std))
            upper = round(predicted + 1.96 * noise_std)

            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'dayOfWeek': pred_date.strftime('%A'),
                'predictedFootfall': round(predicted),
                'confidenceInterval': [lower, upper],
            })

        return predictions

    def recommend_slots(self, target_date, slots_config):
        """Recommend least crowded slots based on historical patterns."""
        prediction = self.predict(target_date, 1)[0]
        total = prediction['predictedFootfall']
        num_slots = len(slots_config)

        if num_slots == 0:
            return []

        # Distribute predicted demand across slots (morning/evening peaks)
        slot_distribution = []
        for i, slot in enumerate(slots_config):
            # Model morning and evening peaks
            hour = int(slot.get('startTime', '10:00').split(':')[0])
            if 8 <= hour <= 10:
                factor = 1.4  # Morning rush
            elif 16 <= hour <= 18:
                factor = 1.3  # Evening rush
            elif 12 <= hour <= 14:
                factor = 0.7  # Lunch lull
            else:
                factor = 1.0

            predicted_slot = round(total / num_slots * factor)
            capacity = slot.get('capacity', 50)
            load_pct = min(100, round((predicted_slot / max(capacity, 1)) * 100))

            slot_distribution.append({
                'slotId': slot.get('slotId', f'SLOT-{i+1}'),
                'startTime': slot.get('startTime'),
                'endTime': slot.get('endTime'),
                'predictedLoad': predicted_slot,
                'loadPercentage': load_pct,
                'recommendation': 'low' if load_pct < 40 else 'medium' if load_pct < 70 else 'high',
            })

        return slot_distribution


# Singleton instance
predictor = DemandPredictor()
