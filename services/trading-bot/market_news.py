import json
import logging

import requests
from bs4 import BeautifulSoup

from article import Article
from config import ALPACA_API_KEY, ALPACA_API_SECRET

logger = logging.getLogger(__name__)


def get_articles(api_key=None, api_secret=None, symbol: str = "AAPL"):
    """Fetch news articles for a given stock symbol from Alpaca Markets API.

    Args:
        api_key: Alpaca API key. Defaults to env var via config.
        api_secret: Alpaca API secret. Defaults to env var via config.
        symbol: Stock ticker symbol.

    Returns:
        List of Article objects.

    Raises:
        ValueError: If API keys are missing or ticker is invalid.
        RuntimeError: If the API request fails.
    """
    api_key = api_key or ALPACA_API_KEY
    api_secret = api_secret or ALPACA_API_SECRET

    if not api_key or not api_secret:
        raise ValueError(
            "Alpaca API credentials are not set. "
            "Please set ALPACA_API_KEY and ALPACA_API_SECRET environment variables."
        )

    headers = {
        "Apca-Api-Key-Id": api_key,
        "Apca-Api-Secret-Key": api_secret,
    }
    params = {"symbols": symbol}

    try:
        response = requests.get(
            "https://data.alpaca.markets/v1beta1/news",
            headers=headers,
            params=params,
            timeout=15,
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Request to Alpaca Markets API timed out.")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Failed to connect to Alpaca Markets API.")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Request to Alpaca Markets API failed: {e}")

    if response.status_code == 200:
        data = json.loads(response.text)
        article_objs = Article.read_json_to_articles(data.get("news", []))
        return article_objs
    else:
        raise RuntimeError(
            f"Alpaca Markets API returned status {response.status_code}: "
            f"{response.text}"
        )


def get_page_text(url):
    """Scrape the text content from a web page.

    Args:
        url: The URL to scrape.

    Returns:
        Tuple of (title, list of text sections).
    """
    headers = {"User-Agent": "Mozilla/5.0 (compatible; SentimentBot/1.0)"}
    try:
        response = requests.get(url, timeout=10, headers=headers)
    except requests.exceptions.RequestException:
        return ("", [])

    if not response.ok:
        return ("", [])

    try:
        soup = BeautifulSoup(response.content, "html.parser")

        title_tag = soup.find("title")
        title = title_tag.get_text() if title_tag else ""

        text = soup.get_text("\n", strip=True)
        new_text = []
        for section in text.split("\n"):
            if len(section) > 8:
                new_text.append(section)

        return (title, new_text)
    except Exception:
        logger.warning("Failed to parse page content from %s", url, exc_info=True)
        return ("", [])
