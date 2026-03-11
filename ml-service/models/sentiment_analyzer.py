import re
from collections import Counter


class SentimentAnalyzer:
    """Rule-based + keyword sentiment analyzer for Hindi+English feedback.
    Can be replaced with BERT/DistilBERT model after training data is collected."""

    POSITIVE_WORDS = {
        'good', 'great', 'excellent', 'nice', 'fast', 'quick', 'clean', 'helpful',
        'friendly', 'polite', 'satisfied', 'happy', 'amazing', 'best', 'wonderful',
        'perfect', 'awesome', 'efficient', 'smooth', 'fresh', 'quality', 'timely',
        'accha', 'bahut', 'achha', 'sahi', 'badiya', 'shandar', 'sundar', 'dhanyawad',
        'theek', 'mast',
    }

    NEGATIVE_WORDS = {
        'bad', 'worst', 'terrible', 'slow', 'dirty', 'rude', 'poor', 'horrible',
        'waste', 'delay', 'long', 'queue', 'wait', 'expired', 'stale', 'fraud',
        'cheat', 'corrupt', 'unhygienic', 'closed', 'unavailable', 'shortage',
        'kharab', 'bura', 'ganda', 'dhoka', 'problem', 'pareshani', 'galat',
        'bekaar', 'wahiyat',
    }

    TOPIC_KEYWORDS = {
        'staff behavior': ['staff', 'rude', 'polite', 'helpful', 'friendly', 'behavior', 'attitude', 'karmchari'],
        'queue time': ['queue', 'wait', 'line', 'time', 'slow', 'fast', 'quick', 'delay', 'intezaar'],
        'product quality': ['quality', 'fresh', 'stale', 'expired', 'good', 'bad', 'rice', 'wheat', 'oil', 'sugar'],
        'hygiene': ['clean', 'dirty', 'hygiene', 'hygienic', 'unhygienic', 'safai', 'ganda'],
        'availability': ['available', 'unavailable', 'shortage', 'stock', 'out', 'empty', 'nahi', 'khatam'],
    }

    def analyze(self, text):
        """Analyze sentiment of a feedback text."""
        if not text:
            return {'sentiment': 'neutral', 'sentimentScore': 0, 'topics': [], 'confidence': 0.5}

        text_lower = text.lower()
        words = set(re.findall(r'\b\w+\b', text_lower))

        pos_count = len(words & self.POSITIVE_WORDS)
        neg_count = len(words & self.NEGATIVE_WORDS)
        total = pos_count + neg_count

        if total == 0:
            sentiment = 'neutral'
            score = 0.0
            confidence = 0.3
        elif pos_count > neg_count:
            sentiment = 'positive'
            score = min(1.0, pos_count / max(total, 1))
            confidence = min(0.95, 0.5 + (pos_count - neg_count) * 0.1)
        elif neg_count > pos_count:
            sentiment = 'negative'
            score = max(-1.0, -neg_count / max(total, 1))
            confidence = min(0.95, 0.5 + (neg_count - pos_count) * 0.1)
        else:
            sentiment = 'neutral'
            score = 0.0
            confidence = 0.4

        # Extract topics
        topics = []
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                topics.append(topic)

        return {
            'sentiment': sentiment,
            'sentimentScore': round(score, 3),
            'topics': topics,
            'confidence': round(confidence, 3),
        }

    def batch_analyze(self, texts):
        """Analyze a batch of feedback texts."""
        return [self.analyze(t) for t in texts]


# Singleton
analyzer = SentimentAnalyzer()
