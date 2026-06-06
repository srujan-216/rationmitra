from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from models.demand_predictor import predictor
from models.sentiment_analyzer import analyzer
from models.face_recognition_service import face_service
from models.stock_forecaster import stock_forecaster

app = Flask(__name__)
CORS(app)


# ==================== Health ====================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-service'})


@app.route('/api/ml/model-status', methods=['GET'])
def model_status():
    return jsonify({
        'demandModel': {'status': 'trained' if predictor.trained else 'ready', 'type': 'weighted_moving_average'},
        'sentimentModel': {'status': 'ready', 'type': 'keyword_based_bilingual'},
        'faceRecognition': {'status': 'ready', 'type': 'embedding_128d'},
        'stockForecaster': {'status': 'ready', 'type': 'trend_analysis'},
    })


# ==================== Demand Prediction ====================

@app.route('/api/ml/predict-demand', methods=['POST'])
def predict_demand():
    """Predict footfall for a given shop and date."""
    data = request.json
    target_date = data.get('date')
    num_days = data.get('numDays', 7)
    historical = data.get('historicalData')

    if not target_date:
        return jsonify({'error': 'date is required'}), 400

    # Train if historical data provided
    if historical:
        predictor.train(historical)

    predictions = predictor.predict(target_date, num_days)

    return jsonify({
        'predictions': predictions,
        'modelTrained': predictor.trained,
    })


@app.route('/api/ml/recommend-slots', methods=['POST'])
def recommend_slots():
    """Recommend least crowded slots for a date."""
    data = request.json
    target_date = data.get('date')
    slots_config = data.get('slots', [])
    historical = data.get('historicalData')

    if not target_date:
        return jsonify({'error': 'date is required'}), 400

    if historical:
        predictor.train(historical)

    recommendations = predictor.recommend_slots(target_date, slots_config)

    return jsonify({
        'date': target_date,
        'slotRecommendations': recommendations,
    })


# ==================== Sentiment Analysis ====================

@app.route('/api/ml/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of feedback text."""
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'text is required'}), 400

    result = analyzer.analyze(text)
    result['text'] = text
    return jsonify(result)


@app.route('/api/ml/batch-sentiment', methods=['POST'])
def batch_sentiment():
    """Analyze sentiment of multiple feedback texts."""
    data = request.json
    texts = data.get('texts', [])

    if not texts:
        return jsonify({'error': 'texts array is required'}), 400

    results = analyzer.batch_analyze(texts)
    return jsonify({'results': results, 'count': len(results)})


# ==================== Face Recognition ====================

MAX_IMAGE_B64_BYTES = 4 * 1024 * 1024  # 4 MB


@app.route('/api/ml/face/generate-embedding', methods=['POST'])
def generate_face_embedding():
    """Generate 128D face embedding from base64 image."""
    data = request.json
    image_b64 = data.get('image')

    if not image_b64 or not isinstance(image_b64, str):
        return jsonify({'error': 'image (base64 string) is required'}), 400
    if len(image_b64.encode('utf-8')) > MAX_IMAGE_B64_BYTES:
        return jsonify({'error': 'Image too large. Maximum size is 3 MB.'}), 413

    # Anti-spoofing check
    spoof_check = face_service.detect_spoofing(image_b64)
    if not spoof_check['is_live']:
        return jsonify({'error': 'Spoofing detected', 'details': spoof_check}), 403

    embedding, error = face_service.generate_embedding(image_b64)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'embedding': embedding,
        'dimensions': len(embedding),
        'livenessCheck': spoof_check,
    })


@app.route('/api/ml/face/verify', methods=['POST'])
def verify_face():
    """Verify live face against stored embedding."""
    data = request.json
    live_image = data.get('liveImage')
    stored_embedding = data.get('storedEmbedding')

    if not live_image or not isinstance(live_image, str):
        return jsonify({'error': 'liveImage (base64 string) is required'}), 400
    if not stored_embedding or not isinstance(stored_embedding, list):
        return jsonify({'error': 'storedEmbedding (array) is required'}), 400
    if len(live_image.encode('utf-8')) > MAX_IMAGE_B64_BYTES:
        return jsonify({'error': 'Image too large. Maximum size is 3 MB.'}), 413

    # Generate embedding from live image
    live_embedding, error = face_service.generate_embedding(live_image)
    if error:
        return jsonify({'error': f'Failed to process live image: {error}'}), 400

    # Compare
    is_match, score, message = face_service.verify(live_embedding, stored_embedding)

    return jsonify({
        'verified': is_match,
        'confidence': score,
        'message': message,
        'threshold': face_service.MATCH_THRESHOLD,
    })


# ==================== Stock Forecasting ====================

@app.route('/api/ml/forecast-stock', methods=['POST'])
def forecast_stock():
    """Forecast stock depletion for an item."""
    data = request.json
    current_stock = data.get('currentStock', 0)
    stock_history = data.get('stockHistory', [])
    reorder_level = data.get('reorderLevel', 100)

    forecast = stock_forecaster.forecast(current_stock, stock_history, reorder_level)

    return jsonify(forecast)


@app.route('/api/ml/batch-forecast-stock', methods=['POST'])
def batch_forecast_stock():
    """Forecast stock for multiple items."""
    data = request.json
    items = data.get('items', [])

    results = []
    for item in items:
        forecast = stock_forecaster.forecast(
            item.get('currentStock', 0),
            item.get('stockHistory', []),
            item.get('reorderLevel', 100),
        )
        forecast['itemName'] = item.get('itemName', 'Unknown')
        results.append(forecast)

    return jsonify({'forecasts': results, 'count': len(results)})


# ==================== Main ====================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')
