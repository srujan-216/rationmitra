"""Tests for ML service models."""
import pytest
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.demand_predictor import DemandPredictor
from models.sentiment_analyzer import SentimentAnalyzer
from models.face_recognition_service import FaceRecognitionService
from models.stock_forecaster import StockForecaster


class TestDemandPredictor:
    def setup_method(self):
        self.predictor = DemandPredictor()

    def test_predict_without_training(self):
        result = self.predictor.predict('2026-03-15', 1)
        assert len(result) == 1
        assert 'predictedFootfall' in result[0]
        assert 'confidenceInterval' in result[0]

    def test_predict_multiple_days(self):
        result = self.predictor.predict('2026-03-15', 7)
        assert len(result) == 7
        dates = [r['date'] for r in result]
        assert len(set(dates)) == 7  # All unique dates

    def test_train_with_data(self):
        data = [{'date': f'2026-02-{d:02d}', 'footfall': 30 + d} for d in range(1, 29)]
        self.predictor.train(data)
        assert self.predictor.trained is True
        assert self.predictor.base_demand > 0

    def test_train_with_insufficient_data(self):
        data = [{'date': '2026-02-01', 'footfall': 30}]
        self.predictor.train(data)
        assert self.predictor.trained is False

    def test_recommend_slots(self):
        slots = [
            {'slotId': 'SLOT-1', 'startTime': '08:00', 'endTime': '10:00', 'capacity': 50},
            {'slotId': 'SLOT-2', 'startTime': '12:00', 'endTime': '14:00', 'capacity': 50},
        ]
        result = self.predictor.recommend_slots('2026-03-15', slots)
        assert len(result) == 2
        assert result[0]['recommendation'] in ['low', 'medium', 'high']

    def test_recommend_empty_slots(self):
        result = self.predictor.recommend_slots('2026-03-15', [])
        assert result == []


class TestSentimentAnalyzer:
    def setup_method(self):
        self.analyzer = SentimentAnalyzer()

    def test_positive_sentiment(self):
        result = self.analyzer.analyze('Very good service, excellent staff, amazing quality')
        assert result['sentiment'] == 'positive'
        assert result['sentimentScore'] > 0

    def test_negative_sentiment(self):
        result = self.analyzer.analyze('Terrible service, rude staff, long queue, dirty shop')
        assert result['sentiment'] == 'negative'
        assert result['sentimentScore'] < 0

    def test_neutral_sentiment(self):
        result = self.analyzer.analyze('I visited the shop today')
        assert result['sentiment'] == 'neutral'

    def test_empty_text(self):
        result = self.analyzer.analyze('')
        assert result['sentiment'] == 'neutral'
        assert result['sentimentScore'] == 0

    def test_hindi_positive(self):
        result = self.analyzer.analyze('Bahut accha tha, badiya service')
        assert result['sentiment'] == 'positive'

    def test_hindi_negative(self):
        result = self.analyzer.analyze('Kharab service, bura experience, pareshani')
        assert result['sentiment'] == 'negative'

    def test_topic_extraction(self):
        result = self.analyzer.analyze('Staff was very helpful and polite')
        assert 'staff behavior' in result['topics']

    def test_queue_topic(self):
        result = self.analyzer.analyze('Had to wait in long queue for hours')
        assert 'queue time' in result['topics']

    def test_batch_analyze(self):
        texts = ['Good service', 'Bad experience', 'Normal visit']
        results = self.analyzer.batch_analyze(texts)
        assert len(results) == 3


class TestFaceRecognitionService:
    def setup_method(self):
        self.service = FaceRecognitionService()

    def test_generate_embedding(self):
        embedding, error = self.service.generate_embedding('test_image_base64_data')
        assert error is None
        assert len(embedding) == 128

    def test_generate_embedding_empty(self):
        embedding, error = self.service.generate_embedding('')
        assert embedding is None
        assert error is not None

    def test_generate_embedding_none(self):
        embedding, error = self.service.generate_embedding(None)
        assert embedding is None

    def test_compare_same_embedding(self):
        embedding, _ = self.service.generate_embedding('test_data')
        score = self.service.compare_embeddings(embedding, embedding)
        assert score == 1.0

    def test_compare_different_embeddings(self):
        e1, _ = self.service.generate_embedding('image_1')
        e2, _ = self.service.generate_embedding('image_2')
        score = self.service.compare_embeddings(e1, e2)
        assert 0 <= score <= 1

    def test_verify_same_face(self):
        embedding, _ = self.service.generate_embedding('same_face')
        is_match, score, message = self.service.verify(embedding, embedding)
        assert is_match is True
        assert score == 1.0

    def test_detect_spoofing(self):
        result = self.service.detect_spoofing('test_image')
        assert result['is_live'] is True


class TestStockForecaster:
    def setup_method(self):
        self.forecaster = StockForecaster()

    def test_forecast_no_history(self):
        result = self.forecaster.forecast(500, [])
        assert result['currentStock'] == 500
        assert result['avgDailyConsumption'] == 0
        assert result['trend'] == 'insufficient_data'

    def test_forecast_with_outward_history(self):
        history = [
            {'quantity': 20, 'transactionType': 'outward'} for _ in range(10)
        ]
        result = self.forecaster.forecast(200, history)
        assert result['avgDailyConsumption'] == 20
        assert result['daysUntilDepletion'] == 10

    def test_forecast_critical_urgency(self):
        history = [{'quantity': 100, 'transactionType': 'outward'} for _ in range(5)]
        result = self.forecaster.forecast(200, history)
        assert result['reorderUrgency'] in ['critical', 'high']

    def test_forecast_low_urgency(self):
        history = [{'quantity': 5, 'transactionType': 'outward'} for _ in range(5)]
        result = self.forecaster.forecast(500, history)
        assert result['reorderUrgency'] == 'low'

    def test_forecast_low_stock_flag(self):
        result = self.forecaster.forecast(50, [], reorder_level=100)
        assert result['isLowStock'] is True

    def test_forecast_not_low_stock(self):
        result = self.forecaster.forecast(500, [], reorder_level=100)
        assert result['isLowStock'] is False

    def test_forecast_inward_only(self):
        history = [{'quantity': 100, 'transactionType': 'inward'} for _ in range(5)]
        result = self.forecaster.forecast(500, history)
        assert result['avgDailyConsumption'] == 0
        assert result['daysUntilDepletion'] is None


class TestFlaskApp:
    def setup_method(self):
        from app import app
        self.client = app.test_client()

    def test_health_endpoint(self):
        res = self.client.get('/api/health')
        assert res.status_code == 200
        data = res.get_json()
        assert data['status'] == 'ok'

    def test_model_status(self):
        res = self.client.get('/api/ml/model-status')
        assert res.status_code == 200
        data = res.get_json()
        assert 'demandModel' in data
        assert 'sentimentModel' in data

    def test_predict_demand(self):
        res = self.client.post('/api/ml/predict-demand', json={'date': '2026-03-15', 'numDays': 3})
        assert res.status_code == 200
        data = res.get_json()
        assert len(data['predictions']) == 3

    def test_predict_demand_missing_date(self):
        res = self.client.post('/api/ml/predict-demand', json={})
        assert res.status_code == 400

    def test_analyze_sentiment(self):
        res = self.client.post('/api/ml/analyze-sentiment', json={'text': 'Great service'})
        assert res.status_code == 200
        data = res.get_json()
        assert data['sentiment'] == 'positive'

    def test_analyze_sentiment_missing_text(self):
        res = self.client.post('/api/ml/analyze-sentiment', json={})
        assert res.status_code == 400

    def test_face_generate_embedding(self):
        res = self.client.post('/api/ml/face/generate-embedding', json={'image': 'test_base64'})
        assert res.status_code == 200
        data = res.get_json()
        assert data['dimensions'] == 128

    def test_face_generate_missing_image(self):
        res = self.client.post('/api/ml/face/generate-embedding', json={})
        assert res.status_code == 400

    def test_forecast_stock(self):
        res = self.client.post('/api/ml/forecast-stock', json={
            'currentStock': 500,
            'stockHistory': [{'quantity': 20, 'transactionType': 'outward'} for _ in range(5)],
            'reorderLevel': 100,
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data['currentStock'] == 500

    def test_batch_forecast(self):
        res = self.client.post('/api/ml/batch-forecast-stock', json={
            'items': [
                {'itemName': 'Rice', 'currentStock': 500, 'stockHistory': [], 'reorderLevel': 100},
                {'itemName': 'Wheat', 'currentStock': 300, 'stockHistory': [], 'reorderLevel': 80},
            ]
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data['count'] == 2

    def test_recommend_slots(self):
        res = self.client.post('/api/ml/recommend-slots', json={
            'date': '2026-03-15',
            'slots': [{'slotId': 'S1', 'startTime': '08:00', 'endTime': '10:00', 'capacity': 50}],
        })
        assert res.status_code == 200
        data = res.get_json()
        assert len(data['slotRecommendations']) == 1

    def test_batch_sentiment(self):
        res = self.client.post('/api/ml/batch-sentiment', json={
            'texts': ['Good', 'Bad', 'Ok']
        })
        assert res.status_code == 200
        assert res.get_json()['count'] == 3
