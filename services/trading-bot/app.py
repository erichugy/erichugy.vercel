import re

from flask import Flask, jsonify, request

from analysis import analyze_text_list
from config import COHERE_API_KEY
from market_news import get_articles, get_page_text
from article import Article
from typing import List

app = Flask(__name__)


def analyse_news(article_objs: List[Article], fast: bool = False):
    """Analyze news articles and return sentiment details.

    Args:
        article_objs: List of Article objects to analyze.
        fast: If True, only use headlines. If False, scrape full article text.

    Returns:
        Tuple of (sentiment_score, articles_detail_list).
    """
    total_score = 0.0
    articles_detail = []

    for article in article_objs:
        if fast:
            text_lines = [article.headline]
            title = article.headline
        else:
            title, text_lines = get_page_text(article.url)
            text_lines.append(title)

        # Use Cohere ML model if API key is available, otherwise fall back to word-based
        if COHERE_API_KEY:
            from model import sentiment
            score = sentiment(text_lines)
        else:
            score = analyze_text_list(text_lines)
        total_score += score

        if score > 0.05:
            sentiment_label = "positive"
        elif score < -0.05:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"

        articles_detail.append(
            {
                "title": title or article.headline,
                "source": article.url,
                "sentiment": sentiment_label,
            }
        )

    avg_score = total_score / len(article_objs) if article_objs else 0.0
    return avg_score, articles_detail


def get_stock_prediction(ticker: str, fast: bool = False, threshold: float = 0.15):
    """Get a buy/sell/hold recommendation for a stock ticker.

    Args:
        ticker: Stock ticker symbol.
        fast: If True, only analyze headlines.
        threshold: Score threshold for buy/sell decisions.

    Returns:
        Dict with recommendation details.
    """
    article_objs = get_articles(symbol=ticker)

    if not article_objs:
        return {
            "ticker": ticker,
            "recommendation": "HOLD",
            "confidence": 0.0,
            "sentiment_score": 0.0,
            "articles_analyzed": 0,
            "articles": [],
        }

    sentiment_score, articles_detail = analyse_news(article_objs, fast=fast)

    confidence = min(abs(sentiment_score) / max(threshold, 0.01), 1.0)

    if sentiment_score > threshold:
        recommendation = "BUY"
    elif sentiment_score < -threshold:
        recommendation = "SELL"
    else:
        recommendation = "HOLD"

    return {
        "ticker": ticker,
        "recommendation": recommendation,
        "confidence": round(confidence, 4),
        "sentiment_score": round(sentiment_score, 4),
        "articles_analyzed": len(articles_detail),
        "articles": articles_detail,
    }


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "trading-bot"})


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "ticker" not in data:
        return jsonify({"error": "Missing required field: ticker"}), 400

    ticker = str(data["ticker"]).strip().upper()

    if not re.match(r"^[A-Z0-9]{1,5}$", ticker):
        return (
            jsonify(
                {
                    "error": "Invalid ticker symbol. Must be 1-5 alphanumeric characters."
                }
            ),
            400,
        )

    fast = bool(data.get("fast", False))

    try:
        result = get_stock_prediction(ticker, fast=fast)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Internal server error: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
