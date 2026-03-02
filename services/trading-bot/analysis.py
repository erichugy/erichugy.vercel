from pathlib import Path
from typing import List

_DATA_DIR = Path(__file__).parent / "data"


def _load_words(filename: str) -> set:
    """Load words from a text file, one per line.

    Strips quotes, commas, and whitespace from each line.
    """
    filepath = _DATA_DIR / filename
    words = set()
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            word = line.strip().strip('"').strip(",").strip("'").lower()
            if word:
                words.add(word)
    return words


_POSITIVE_WORDS = None
_NEGATIVE_WORDS = None


def _get_positive_words() -> set:
    global _POSITIVE_WORDS
    if _POSITIVE_WORDS is None:
        _POSITIVE_WORDS = _load_words("positive_words.txt")
    return _POSITIVE_WORDS


def _get_negative_words() -> set:
    global _NEGATIVE_WORDS
    if _NEGATIVE_WORDS is None:
        _NEGATIVE_WORDS = _load_words("negative_words.txt")
    return _NEGATIVE_WORDS


def word_sentiment(text: str) -> float:
    """Analyze sentiment of text using positive/negative word counts.

    Args:
        text: The text to analyze.

    Returns:
        A sentiment score as a float between -1.0 and 1.0.
        Positive values indicate positive sentiment.
    """
    positive_words = _get_positive_words()
    negative_words = _get_negative_words()

    words = text.lower().split()
    if not words:
        return 0.0

    positive_count = 0
    negative_count = 0

    for word in words:
        cleaned = word.strip(".,!?;:'\"()[]{}").lower()
        if cleaned in positive_words:
            positive_count += 1
        elif cleaned in negative_words:
            negative_count += 1

    total = positive_count + negative_count
    if total == 0:
        return 0.0

    score = (positive_count - negative_count) / total
    return score


def analyze_text_list(texts: List[str]) -> float:
    """Analyze sentiment across a list of text segments.

    Args:
        texts: List of text strings to analyze.

    Returns:
        Average sentiment score across all texts.
    """
    if not texts:
        return 0.0

    combined = " ".join(texts)
    return word_sentiment(combined)
