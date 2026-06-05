import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

nltk.download('vader_lexicon', quiet=True)


class SentimentAnalyzer:
    """
    VADER (Valence Aware Dictionary and sEntiment Reasoner) for English,
    extended with a Hindi lexicon injected directly into VADER's internal
    word-valence dictionary so the same scoring pipeline handles both languages.

    VADER reference: Hutto & Gilbert, ICWSM 2014.
    """

    # Hindi valence scores on VADER's scale (-4 to +4)
    HINDI_LEXICON = {
        # Positive
        'accha': 2.0, 'achha': 2.0, 'sahi': 1.5, 'badiya': 2.5,
        'shandar': 3.0, 'sundar': 2.0, 'dhanyawad': 1.5, 'theek': 1.0,
        'mast': 2.0, 'khush': 2.5, 'badhiya': 2.5, 'zabardast': 3.0,
        'lajawaab': 3.0, 'shukriya': 1.5, 'acha': 2.0,
        # Negative
        'kharab': -2.5, 'bura': -2.0, 'buri': -2.0, 'ganda': -2.0,
        'dhoka': -3.0, 'pareshani': -2.0, 'galat': -1.5, 'bekaar': -2.5,
        'wahiyat': -2.5, 'kami': -1.5, 'takleef': -2.0, 'bura': -2.0,
        'nuksaan': -1.5, 'shikayat': -1.5,
    }

    TOPIC_KEYWORDS = {
        'staff behavior': ['staff', 'rude', 'polite', 'helpful', 'friendly',
                           'behavior', 'attitude', 'karmchari'],
        'queue time': ['queue', 'wait', 'line', 'time', 'slow', 'fast',
                       'quick', 'delay', 'intezaar'],
        'product quality': ['quality', 'fresh', 'stale', 'expired', 'rice',
                            'wheat', 'oil', 'sugar', 'dal'],
        'hygiene': ['clean', 'dirty', 'hygiene', 'hygienic', 'unhygienic',
                    'safai', 'ganda'],
        'availability': ['available', 'unavailable', 'shortage', 'stock',
                         'empty', 'nahi', 'khatam'],
    }

    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        self.vader.lexicon.update(self.HINDI_LEXICON)

    def analyze(self, text):
        if not text:
            return {'sentiment': 'neutral', 'sentimentScore': 0.0,
                    'topics': [], 'confidence': 0.5}

        scores = self.vader.polarity_scores(text)
        compound = scores['compound']  # range: -1.0 to +1.0

        if compound >= 0.05:
            sentiment = 'positive'
        elif compound <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'

        # Confidence: distance from the neutral boundary
        confidence = round(min(0.95, 0.5 + abs(compound) * 0.5), 3)

        text_lower = text.lower()
        topics = [
            topic for topic, kws in self.TOPIC_KEYWORDS.items()
            if any(kw in text_lower for kw in kws)
        ]

        return {
            'sentiment': sentiment,
            'sentimentScore': round(compound, 3),
            'topics': topics,
            'confidence': confidence,
        }

    def batch_analyze(self, texts):
        return [self.analyze(t) for t in texts]


analyzer = SentimentAnalyzer()
