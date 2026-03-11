import numpy as np
import base64
import hashlib
import json


class FaceRecognitionService:
    """Face recognition using 128D embeddings.

    Production: Replace generate_embedding with actual OpenCV DNN / face_recognition library.
    Current: Simulates face encoding for development and testing.
    """

    MATCH_THRESHOLD = 0.6  # Cosine similarity threshold (lower = stricter)

    def generate_embedding(self, image_base64):
        """
        Generate 128D face embedding from base64-encoded image.

        In production, this would:
        1. Decode base64 to image
        2. Detect face using Haar cascade or DNN
        3. Align face
        4. Generate 128D embedding via FaceNet/dlib

        For development, generates a deterministic embedding from image hash.
        """
        if not image_base64:
            return None, 'No image provided'

        try:
            # Hash the image to create deterministic embedding for testing
            img_hash = hashlib.sha256(image_base64.encode()).hexdigest()
            # Convert hash to 128D normalized vector
            seed = int(img_hash[:8], 16)
            rng = np.random.RandomState(seed)
            embedding = rng.randn(128).astype(float)
            embedding = embedding / np.linalg.norm(embedding)
            return embedding.tolist(), None
        except Exception as e:
            return None, str(e)

    def compare_embeddings(self, embedding1, embedding2):
        """
        Compare two 128D embeddings using cosine similarity.
        Returns match score (0-1) where 1 = identical.
        """
        e1 = np.array(embedding1)
        e2 = np.array(embedding2)

        # Cosine similarity
        similarity = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
        # Convert to 0-1 score
        score = (similarity + 1) / 2
        return round(float(score), 4)

    def verify(self, live_embedding, stored_embedding):
        """
        Verify if live capture matches stored enrollment.
        Returns: (is_match, confidence_score, message)
        """
        score = self.compare_embeddings(live_embedding, stored_embedding)
        threshold = (1 + self.MATCH_THRESHOLD) / 2  # Convert to 0-1 scale

        if score >= threshold:
            return True, score, 'Identity verified successfully'
        else:
            return False, score, 'Face mismatch - verification failed'

    def detect_spoofing(self, image_base64):
        """
        Basic anti-spoofing check (placeholder).
        Production: Use liveness detection (blink, head movement, texture analysis).
        """
        # Placeholder - always passes in development
        return {
            'is_live': True,
            'confidence': 0.95,
            'method': 'placeholder',
        }


# Singleton
face_service = FaceRecognitionService()
