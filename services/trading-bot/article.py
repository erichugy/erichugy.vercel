import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class Article:
    def __init__(self, url, date, headline, symbol):
        self.url = url
        try:
            self.date = datetime.strptime(date, r"%Y-%m-%dT%H:%M:%SZ")
        except (ValueError, TypeError) as e:
            logger.warning("Failed to parse date '%s': %s — using current time", date, e)
            self.date = datetime.utcnow()
        self.headline = headline
        self.symbol = symbol
        self.content = ()

    def __str__(self):
        return self.headline

    def __repr__(self):
        return (
            f"Article(url={self.url}, date={self.date}, "
            f"headline={self.headline}, symbol={self.symbol})"
        )

    @classmethod
    def read_json_to_articles(cls, json_data) -> list:
        articles = []
        for i, item in enumerate(json_data):
            try:
                articles.append(
                    Article(
                        item["url"],
                        item["created_at"],
                        item["headline"],
                        item["symbols"],
                    )
                )
            except (KeyError, ValueError, TypeError) as e:
                # NOTE: skip malformed articles rather than aborting the entire batch
                logger.warning("Skipping article at index %d: %s", i, e)
        return articles
