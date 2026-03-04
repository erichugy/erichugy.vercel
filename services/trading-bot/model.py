import threading

import cohere
from config import COHERE_API_KEY
from typing import List

_client_lock = threading.Lock()
_client: cohere.Client | None = None


def _get_client() -> cohere.Client:
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                if not COHERE_API_KEY:
                    raise RuntimeError(
                        "COHERE_API_KEY environment variable is not set. "
                        "Set COHERE_API_KEY to a valid Cohere API key to enable ML-based sentiment classification."
                    )
                _client = cohere.Client(COHERE_API_KEY)
    return _client


def sentiment(input_texts: List[str]):
    """Classify sentiment of text using Cohere's classify endpoint.

    Returns a recommendation score between -1 and 1.
    """
    co = _get_client()

    recommendation_score = 0.0
    batch_size = 95

    for i in range(0, len(input_texts), batch_size):
        batch = input_texts[i : i + batch_size]
        if not batch:
            continue

        try:
            classifications = co.classify(
                model="9dad2d66-6da3-4aff-8812-73a58cce7e99-ft",
                inputs=batch,
            )
        except Exception as e:
            raise RuntimeError(f"Cohere API classification failed: {e}")

        k = len(classifications.classifications)
        for classification in classifications.classifications:
            if classification.prediction == "positive":
                recommendation_score += classification.confidence / k
            elif classification.prediction == "negative":
                recommendation_score -= classification.confidence / k

    return recommendation_score
