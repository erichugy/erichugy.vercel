from datetime import datetime


class Article:
    def __init__(self, url, date, headline, symbol):
        self.url = url
        self.date = datetime.strptime(date, r"%Y-%m-%dT%H:%M:%SZ")
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
        for item in json_data:
            articles.append(
                Article(
                    item["url"],
                    item["created_at"],
                    item["headline"],
                    item["symbols"],
                )
            )
        return articles
