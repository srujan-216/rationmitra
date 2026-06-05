import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler


class DemandPredictor:
    """
    Footfall forecasting using Random Forest with engineered time-series features.
    Confidence intervals derived from per-tree variance across the forest.
    Falls back to day-of-week weighted average when training data is insufficient.
    """

    MIN_TRAIN_SAMPLES = 14

    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100, max_depth=6, min_samples_leaf=2,
            random_state=42, n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.trained = False
        self.base_demand = 40
        self.history = []

    # ------------------------------------------------------------------
    # Feature engineering
    # ------------------------------------------------------------------

    def _features(self, date, lag1, lag7, rolling7):
        """8-feature vector for a single date."""
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d')
        return [
            date.weekday(),                    # 0 Mon – 6 Sun
            date.month,                        # 1–12
            date.day,                          # 1–31
            1 if date.day <= 5 else 0,         # is_month_start
            1 if date.day >= 26 else 0,        # is_month_end
            lag1,
            lag7,
            rolling7,
        ]

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self, historical_data):
        if not historical_data or len(historical_data) < self.MIN_TRAIN_SAMPLES:
            return

        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        self.base_demand = float(df['footfall'].mean())
        self.history = df['footfall'].tolist()

        X, y = [], []
        footfall = df['footfall'].tolist()

        for i in range(7, len(df)):
            lag1 = footfall[i - 1]
            lag7 = footfall[i - 7]
            rolling7 = float(np.mean(footfall[max(0, i - 7):i]))
            X.append(self._features(df['date'].iloc[i], lag1, lag7, rolling7))
            y.append(footfall[i])

        X_scaled = self.scaler.fit_transform(np.array(X))
        self.model.fit(X_scaled, np.array(y))
        self.trained = True

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(self, target_date, num_days=1):
        target = (
            datetime.strptime(target_date, '%Y-%m-%d')
            if isinstance(target_date, str) else target_date
        )
        history = list(self.history) if self.history else [self.base_demand] * 14
        predictions = []

        # Day-of-week bias used for fallback
        dow_bias = [0.9, 1.0, 1.0, 1.0, 1.1, 1.3, 1.2]

        for i in range(num_days):
            pred_date = target + timedelta(days=i)
            lag1 = history[-1]
            lag7 = history[-7] if len(history) >= 7 else self.base_demand
            rolling7 = float(np.mean(history[-7:])) if len(history) >= 7 else self.base_demand

            features = np.array([self._features(pred_date, lag1, lag7, rolling7)])

            if self.trained:
                features_scaled = self.scaler.transform(features)
                # Per-tree predictions → mean + std for confidence interval
                tree_preds = np.array([
                    t.predict(features_scaled)[0] for t in self.model.estimators_
                ])
                predicted = float(np.mean(tree_preds))
                std = float(np.std(tree_preds))
            else:
                predicted = rolling7 * dow_bias[pred_date.weekday()]
                std = predicted * 0.15

            predicted = max(0.0, predicted)
            lower = max(0, round(predicted - 1.96 * std))
            upper = round(predicted + 1.96 * std)

            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'dayOfWeek': pred_date.strftime('%A'),
                'predictedFootfall': round(predicted),
                'confidenceInterval': [lower, upper],
            })
            history.append(round(predicted))

        return predictions

    # ------------------------------------------------------------------
    # Slot recommendation
    # ------------------------------------------------------------------

    def recommend_slots(self, target_date, slots_config):
        prediction = self.predict(target_date, 1)[0]
        total = prediction['predictedFootfall']
        num_slots = len(slots_config)
        if num_slots == 0:
            return []

        slot_distribution = []
        for i, slot in enumerate(slots_config):
            hour = int(slot.get('startTime', '10:00').split(':')[0])
            if 8 <= hour <= 10:
                factor = 1.4
            elif 16 <= hour <= 18:
                factor = 1.3
            elif 12 <= hour <= 14:
                factor = 0.7
            else:
                factor = 1.0

            predicted_slot = round(total / num_slots * factor)
            capacity = slot.get('capacity', 50)
            load_pct = min(100, round((predicted_slot / max(capacity, 1)) * 100))

            slot_distribution.append({
                'slotId': slot.get('slotId', f'SLOT-{i + 1}'),
                'startTime': slot.get('startTime'),
                'endTime': slot.get('endTime'),
                'predictedLoad': predicted_slot,
                'loadPercentage': load_pct,
                'recommendation': 'low' if load_pct < 40 else 'medium' if load_pct < 70 else 'high',
            })

        return slot_distribution


predictor = DemandPredictor()
