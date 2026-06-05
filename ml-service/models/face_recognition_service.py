import base64
import numpy as np
from io import BytesIO
from PIL import Image


class FaceRecognitionService:
    """
    Face recognition via Local Binary Pattern (LBP) histograms.

    Algorithm: Ahonen, Hadid & Pietikäinen — "Face Description with Local
    Binary Patterns: Application to Face Recognition", IEEE TPAMI 2006.

    Pipeline:
      1. Decode base64 → grayscale 64×64 image
      2. Compute LBP over the whole image (radius-1, 8 neighbours)
      3. Divide into 4×4 spatial grid → 16 cells × 8-bin histograms = 128D
      4. L2-normalise → compare with cosine similarity

    Liveness detection uses Laplacian-variance texture analysis: live faces
    captured by a camera have higher high-frequency content than printed
    photos or replayed video frames.
    """

    FACE_SIZE = (64, 64)
    MATCH_THRESHOLD = 0.82   # cosine similarity (0–1); tunable
    LIVENESS_THRESHOLD = 50  # Laplacian variance; tune per camera

    # ------------------------------------------------------------------
    # Image helpers
    # ------------------------------------------------------------------

    def _decode(self, image_base64):
        """Decode base64 (optionally data-URI) → grayscale float32 numpy array."""
        if ',' in image_base64:
            image_base64 = image_base64.split(',', 1)[1]
        img = Image.open(BytesIO(base64.b64decode(image_base64))).convert('L')
        img = img.resize(self.FACE_SIZE, Image.LANCZOS)
        return np.array(img, dtype=np.float32)

    # ------------------------------------------------------------------
    # LBP embedding
    # ------------------------------------------------------------------

    def _lbp(self, img):
        """
        Basic LBP: for each pixel compare against 8 neighbours (clockwise
        from top-left) and encode as an 8-bit integer.
        Output shape: (H-2, W-2)
        """
        center = img[1:-1, 1:-1]
        neighbors = [
            img[0:-2, 0:-2], img[0:-2, 1:-1], img[0:-2, 2:],
            img[1:-1, 2:],
            img[2:,   2:],   img[2:,   1:-1], img[2:,   0:-2],
            img[1:-1, 0:-2],
        ]
        lbp = np.zeros_like(center, dtype=np.uint8)
        for bit, nb in enumerate(neighbors):
            lbp += ((nb >= center).astype(np.uint8) << bit)
        return lbp

    def _embedding(self, img):
        """
        Spatial-pyramid LBP histogram.
        4×4 grid → 16 cells, 8 bins each → 128D L2-normalised vector.
        """
        lbp = self._lbp(img)
        h, w = lbp.shape
        ch, cw = h // 4, w // 4
        hists = []
        for r in range(4):
            for c in range(4):
                cell = lbp[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
                hist, _ = np.histogram(cell, bins=8, range=(0, 256))
                hists.append(hist.astype(np.float32))
        vec = np.concatenate(hists)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec.tolist()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_embedding(self, image_base64):
        if not image_base64:
            return None, 'No image provided'
        try:
            img = self._decode(image_base64)
            return self._embedding(img), None
        except Exception as exc:
            return None, str(exc)

    def compare_embeddings(self, e1, e2):
        """Cosine similarity between two L2-normalised LBP vectors."""
        a, b = np.array(e1, dtype=np.float32), np.array(e2, dtype=np.float32)
        denom = np.linalg.norm(a) * np.linalg.norm(b)
        if denom == 0:
            return 0.0
        return round(float(np.dot(a, b) / denom), 4)

    def verify(self, live_embedding, stored_embedding):
        score = self.compare_embeddings(live_embedding, stored_embedding)
        if score >= self.MATCH_THRESHOLD:
            return True, score, 'Identity verified successfully'
        return False, score, 'Face mismatch – verification failed'

    def detect_spoofing(self, image_base64):
        """
        Laplacian-variance liveness check.
        Printed / replayed images are smoother → lower high-frequency variance.
        """
        try:
            img = self._decode(image_base64)
            # Discrete Laplacian via numpy (no scipy needed)
            padded = np.pad(img, 1, mode='reflect')
            laplacian = (
                padded[:-2, 1:-1] + padded[2:, 1:-1] +
                padded[1:-1, :-2] + padded[1:-1, 2:] -
                4 * img
            )
            variance = float(np.var(laplacian))
            is_live = variance > self.LIVENESS_THRESHOLD
            confidence = round(min(0.99, variance / (self.LIVENESS_THRESHOLD * 5)), 3)
            return {
                'is_live': is_live,
                'confidence': confidence,
                'method': 'laplacian_variance',
                'variance': round(variance, 2),
            }
        except Exception:
            return {'is_live': True, 'confidence': 0.5, 'method': 'fallback'}


face_service = FaceRecognitionService()
