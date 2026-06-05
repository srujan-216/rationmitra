"""
End-to-end tests for all ML service endpoints.
Run: python tests/test_endpoints.py
"""
import io
import json
import base64
import struct
import zlib
import datetime
import urllib.request
import urllib.error
import numpy as np

BASE = "http://localhost:5001"

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

results = []

def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())

def get(path):
    with urllib.request.urlopen(f"{BASE}{path}", timeout=10) as r:
        return json.loads(r.read())

def check(name, condition, got=None):
    status = PASS if condition else FAIL
    results.append(condition)
    extra = f"  -> {got}" if got is not None else ""
    print(f"  [{status}] {name}{extra}")

def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print('='*55)

# ── Historical footfall data (30 days, weekend peaks) ─────────────────
def make_history(days=30):
    history = []
    for i in range(days, 0, -1):
        d = datetime.date.today() - datetime.timedelta(days=i)
        dow = d.weekday()
        base = 45 if dow >= 5 else 30
        footfall = base + (i % 7) * 2
        history.append({"date": d.strftime("%Y-%m-%d"), "footfall": footfall})
    return history

def _encode_png(pixels):
    """Encode a (64,64) uint8 numpy array as a base64 PNG string."""
    def chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', c)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', 64, 64, 8, 0, 0, 0, 0))
    raw = b''.join(b'\x00' + bytes(row) for row in pixels)
    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return base64.b64encode(sig + ihdr + idat + iend).decode()

# Image A: fine-grained white noise (many edges → uniform LBP histogram)
rng_a = np.random.RandomState(42)
_noise = np.clip(rng_a.normal(128, 50, (64, 64)), 0, 255).astype(np.uint8)
DUMMY_IMG_B64 = _encode_png(_noise)

# Image B: large 8×8 blocks (few edges → LBP histogram concentrated at 0/255)
rng_b = np.random.RandomState(7)
_blocks = np.repeat(np.repeat(
    rng_b.randint(20, 235, (8, 8), dtype=np.uint8), 8, axis=0), 8, axis=1)
DUMMY_IMG2_B64 = _encode_png(_blocks)


# ══════════════════════════════════════════════════════════════════════
section("1. Health & Model Status")
# ══════════════════════════════════════════════════════════════════════
r = get("/api/health")
check("health returns ok", r.get("status") == "ok", r.get("status"))

r = get("/api/ml/model-status")
check("demandModel present",     "demandModel" in r)
check("sentimentModel present",  "sentimentModel" in r)
check("faceRecognition present", "faceRecognition" in r)
check("stockForecaster present", "stockForecaster" in r)


# ══════════════════════════════════════════════════════════════════════
section("2. Sentiment Analysis")
# ══════════════════════════════════════════════════════════════════════
cases = [
    ("English positive",  "Very good service, staff was helpful and polite",   "positive"),
    ("English negative",  "Terrible experience, shop was dirty and staff rude", "negative"),
    ("Hindi positive",    "Bahut accha tha, badiya service mili",               "positive"),
    ("Hindi negative",    "Bahut kharab tha, ganda aur bura",                  "negative"),
    ("Mixed sentiment",   "Queue was long and slow but staff was friendly",     None),
]
for name, text, expected in cases:
    r = post("/api/ml/analyze-sentiment", {"text": text})
    check(f"{name}: has sentimentScore",  "sentimentScore" in r)
    check(f"{name}: has confidence",      "confidence" in r)
    check(f"{name}: has topics list",     isinstance(r.get("topics"), list))
    if expected:
        check(f"{name}: sentiment={expected}", r.get("sentiment") == expected,
              r.get("sentiment"))

# Batch sentiment
r = post("/api/ml/batch-sentiment", {"texts": [
    "Fast and clean service",
    "Kharab tha, bekaar service",
]})
check("batch: count=2",  r.get("count") == 2)
check("batch: results list", isinstance(r.get("results"), list))
check("batch[0] positive", r["results"][0]["sentiment"] == "positive",
      r["results"][0]["sentiment"])
check("batch[1] negative", r["results"][1]["sentiment"] == "negative",
      r["results"][1]["sentiment"])


# ══════════════════════════════════════════════════════════════════════
section("3. Demand Prediction")
# ══════════════════════════════════════════════════════════════════════
# Without history (fallback mode)
r = post("/api/ml/predict-demand", {"date": "2026-06-15", "numDays": 3})
check("fallback: 3 predictions", len(r["predictions"]) == 3)
check("fallback: modelTrained=false", r["modelTrained"] == False)
for i, p in enumerate(r["predictions"]):
    check(f"fallback[{i}]: predictedFootfall > 0", p["predictedFootfall"] > 0,
          p["predictedFootfall"])
    check(f"fallback[{i}]: confidenceInterval len=2",
          len(p["confidenceInterval"]) == 2)

# With 30 days of history (trained mode)
r = post("/api/ml/predict-demand", {
    "date": "2026-06-15",
    "numDays": 5,
    "historicalData": make_history(30),
})
check("trained: 5 predictions", len(r["predictions"]) == 5)
check("trained: modelTrained=true", r["modelTrained"] == True)
for i, p in enumerate(r["predictions"]):
    lo, hi = p["confidenceInterval"]
    check(f"trained[{i}]: CI lower <= predicted <= upper",
          lo <= p["predictedFootfall"] <= hi,
          f"{lo}–{p['predictedFootfall']}–{hi}")

# Slot recommendation
r = post("/api/ml/recommend-slots", {
    "date": "2026-06-15",
    "historicalData": make_history(30),
    "slots": [
        {"slotId": "SLOT-1", "startTime": "08:00", "endTime": "10:00", "capacity": 50},
        {"slotId": "SLOT-2", "startTime": "12:00", "endTime": "14:00", "capacity": 50},
        {"slotId": "SLOT-3", "startTime": "16:00", "endTime": "18:00", "capacity": 50},
    ],
})
check("slots: 3 recommendations", len(r["slotRecommendations"]) == 3)
morning = next(s for s in r["slotRecommendations"] if s["slotId"] == "SLOT-1")
lunch   = next(s for s in r["slotRecommendations"] if s["slotId"] == "SLOT-2")
evening = next(s for s in r["slotRecommendations"] if s["slotId"] == "SLOT-3")
check("morning load > lunch load (peak vs lull)",
      morning["predictedLoad"] > lunch["predictedLoad"],
      f"morning={morning['predictedLoad']} lunch={lunch['predictedLoad']}")


# ══════════════════════════════════════════════════════════════════════
section("4. Stock Forecasting")
# ══════════════════════════════════════════════════════════════════════
history_stable = [
    {"quantity": 20, "transactionType": "outward"} for _ in range(10)
]
history_increasing = [
    {"quantity": 10 + i * 2, "transactionType": "outward"} for i in range(14)
]
mixed = history_increasing + [
    {"quantity": 500, "transactionType": "inward"},
    {"quantity": 25, "transactionType": "outward"},
]

r = post("/api/ml/forecast-stock", {
    "currentStock": 200, "stockHistory": history_stable, "reorderLevel": 50,
})
check("stable: has depletionDate",   r.get("depletionDate") is not None)
check("stable: avgDailyConsumption=20", r["avgDailyConsumption"] == 20.0,
      r["avgDailyConsumption"])
check("stable: trend=stable",        r["trend"] == "stable", r["trend"])
check("stable: recommendedReorder>0", r["recommendedReorder"] > 0)

r = post("/api/ml/forecast-stock", {
    "currentStock": 100, "stockHistory": history_increasing, "reorderLevel": 50,
})
check("increasing: trend=increasing", r["trend"] == "increasing", r["trend"])
check("increasing: urgency set",      r["reorderUrgency"] in ("low","medium","high","critical"))

r = post("/api/ml/forecast-stock", {
    "currentStock": 10, "stockHistory": history_stable, "reorderLevel": 50,
})
check("critical: isLowStock=true",   r["isLowStock"] == True)
check("critical: urgency=critical",  r["reorderUrgency"] == "critical",
      r["reorderUrgency"])

# Batch forecast
r = post("/api/ml/batch-forecast-stock", {"items": [
    {"itemName": "Rice",  "currentStock": 300, "stockHistory": history_stable,  "reorderLevel": 80},
    {"itemName": "Wheat", "currentStock": 50,  "stockHistory": history_increasing, "reorderLevel": 80},
]})
check("batch: count=2", r["count"] == 2)
check("batch[0] itemName=Rice",  r["forecasts"][0]["itemName"] == "Rice")
check("batch[1] itemName=Wheat", r["forecasts"][1]["itemName"] == "Wheat")


# ══════════════════════════════════════════════════════════════════════
section("5. Face Recognition")
# ══════════════════════════════════════════════════════════════════════
# Enroll: generate embedding for image A (seed=42)
r1 = post("/api/ml/face/generate-embedding", {"image": DUMMY_IMG_B64})
check("enroll: no error",              r1.get("error") is None, r1.get("error"))
check("enroll: 128 dimensions",        r1.get("dimensions") == 128, r1.get("dimensions"))
check("enroll: livenessCheck present", "livenessCheck" in r1)
check("enroll: liveness method=laplacian_variance",
      r1.get("livenessCheck", {}).get("method") == "laplacian_variance")
emb1 = r1["embedding"]

# Verify: same image must match itself (cosine sim = 1.0)
r2 = post("/api/ml/face/verify", {
    "liveImage": DUMMY_IMG_B64,
    "storedEmbedding": emb1,
})
check("verify same/same: verified=true",    r2["verified"] == True,  r2["verified"])
check("verify same/same: confidence>=0.99", r2["confidence"] >= 0.99, r2["confidence"])

# Enroll different image (seed=99) and verify against first embedding
r3 = post("/api/ml/face/generate-embedding", {"image": DUMMY_IMG2_B64})
check("enroll2: no error", r3.get("error") is None, r3.get("error"))
emb2 = r3["embedding"]

r4 = post("/api/ml/face/verify", {
    "liveImage": DUMMY_IMG2_B64,
    "storedEmbedding": emb1,
})
check("verify diff/diff: verified=false", r4["verified"] == False, r4["verified"])
check("verify diff/diff: confidence < same-image score",
      r4["confidence"] < r2["confidence"],
      f"diff={r4['confidence']}  same={r2['confidence']}")


# ══════════════════════════════════════════════════════════════════════
section("Summary")
# ══════════════════════════════════════════════════════════════════════
total  = len(results)
passed = sum(results)
failed = total - passed
print(f"\n  Total: {total}  |  Passed: {passed}  |  Failed: {failed}")
if failed == 0:
    print(f"  \033[92mAll tests passed.\033[0m\n")
else:
    print(f"  \033[91m{failed} test(s) failed.\033[0m\n")
