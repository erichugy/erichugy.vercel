import logging
import os

logger = logging.getLogger(__name__)

ALPACA_API_KEY = os.environ.get("ALPACA_API_KEY", "")
ALPACA_API_SECRET = os.environ.get("ALPACA_API_SECRET", "")
COHERE_API_KEY = os.environ.get("COHERE_API_KEY", "")
_raw_max_articles = os.environ.get("MAX_ARTICLES")
try:
    MAX_ARTICLES = int(_raw_max_articles) if _raw_max_articles is not None else 10
except (TypeError, ValueError):
    logger.warning(
        "Invalid MAX_ARTICLES value %r, falling back to default 10",
        _raw_max_articles,
    )
    MAX_ARTICLES = 10

# NOTE: warn early so container logs surface missing credentials before the first request fails
if not ALPACA_API_KEY or not ALPACA_API_SECRET:
    logger.warning("ALPACA_API_KEY or ALPACA_API_SECRET not set — /analyze will fail")
if not COHERE_API_KEY:
    logger.warning("COHERE_API_KEY not set — falling back to word-based sentiment")
