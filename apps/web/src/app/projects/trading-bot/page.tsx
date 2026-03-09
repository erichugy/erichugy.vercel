"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { TECH_STACK, RECOMMENDATION_STYLES } from "@/data/trading-bot";

const articleSchema = z.object({
  title: z.string(),
  url: z.string(),
  sentiment: z.string(),
  sentiment_score: z.number(),
});

const analysisResultSchema = z.object({
  ticker: z.string(),
  recommendation: z.string(),
  confidence: z.number(),
  sentiment_score: z.number(),
  articles_analyzed: z.number(),
  articles: z.array(articleSchema),
});

type _Article = z.infer<typeof articleSchema>;
type AnalysisResult = z.infer<typeof analysisResultSchema>;

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

function getRecommendationStyle(recommendation: string): string {
  return (
    RECOMMENDATION_STYLES[recommendation.toUpperCase()] ||
    "bg-page border-border text-heading"
  );
}

export default function TradingBotPage() {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [articlesExpanded, setArticlesExpanded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = ticker.trim().toUpperCase();
    if (!trimmed || isLoading) {
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setArticlesExpanded(false);

    // NOTE: capture ref so we can detect if a newer submission superseded this one
    const isStale = () => !isMountedRef.current || abortControllerRef.current !== controller;

    try {
      const response = await fetch(
        `${GATEWAY_URL}/api/services/trading-bot/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: trimmed, fast: false }),
          signal: controller.signal,
        },
      );

      if (isStale()) return;

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || `Request failed with status ${response.status}`,
        );
      }

      let raw: unknown;
      try {
        raw = await response.json();
      } catch {
        if (!isStale()) {
          setError("Received an unexpected response format from the server.");
        }
        return;
      }
      const data = analysisResultSchema.parse(raw);
      if (!isStale()) {
        setResult(data);
      }
    } catch (submitError) {
      if (submitError instanceof Error && submitError.name === "AbortError") {
        return;
      }
      if (isStale()) return;
      if (submitError instanceof z.ZodError) {
        setError("Received an unexpected response format from the server.");
      } else {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      if (!isStale()) {
        setIsLoading(false);
      }
    }
  }

  return (
    <main className="bg-page">
      <section className="px-6 py-20 md:py-28 bg-page">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="font-mono text-sm text-muted tracking-wide mb-4">
              {"< trading_bot />"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading leading-tight mb-3">
              Stock Sentiment Analyzer
            </h1>
            <p className="text-lg md:text-xl text-accent font-medium font-mono tracking-wide uppercase mb-6">
              McHacks 10 Hackathon Project
            </p>
            <p className="text-base md:text-lg text-body leading-relaxed max-w-2xl">
              Enter any stock ticker and this tool fetches the latest news
              articles via the Alpaca Markets API, runs them through Cohere&apos;s
              NLP model to evaluate sentiment, then generates a BUY, SELL, or
              HOLD recommendation with a confidence score.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16 bg-page-alt">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-8">
            Live Demo
          </h2>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
              <label className="flex-1 flex flex-col gap-2 text-body text-sm md:text-base">
                Stock Ticker
                <input
                  type="text"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value)}
                  placeholder="Enter ticker e.g. AAPL"
                  className="px-4 py-3 rounded-lg border border-border bg-page text-heading uppercase"
                  disabled={isLoading}
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!ticker.trim() || isLoading}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-text px-6 py-3 rounded-[10px] transition-all hover:shadow-md font-semibold text-sm whitespace-nowrap"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "Analyze Sentiment"
                  )}
                </button>
              </div>
            </form>

            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <svg
                  className="animate-spin h-10 w-10 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-muted font-mono text-sm">
                  Fetching news and analyzing sentiment...
                </p>
                <button
                  type="button"
                  onClick={() => abortControllerRef.current?.abort()}
                  className="text-sm text-muted hover:text-heading transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            {result ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-6">
                  <p className="text-sm font-mono uppercase tracking-[0.14em] text-muted mb-3">
                    Recommendation for {result.ticker}
                  </p>
                  <span
                    className={`text-4xl md:text-5xl font-bold px-8 py-4 rounded-xl border-2 ${getRecommendationStyle(result.recommendation)}`}
                  >
                    {result.recommendation.toUpperCase()}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-page border border-border rounded-xl p-4">
                    <p className="text-sm text-muted mb-2">Confidence</p>
                    <p className="text-2xl font-bold text-heading mb-2">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-page border border-border rounded-xl p-4">
                    <p className="text-sm text-muted mb-2">Sentiment Score</p>
                    <p className="text-2xl font-bold text-heading">
                      {result.sentiment_score.toFixed(3)}
                    </p>
                  </div>

                  <div className="bg-page border border-border rounded-xl p-4">
                    <p className="text-sm text-muted mb-2">Articles Analyzed</p>
                    <p className="text-2xl font-bold text-heading">
                      {result.articles_analyzed}
                    </p>
                  </div>
                </div>

                {result.articles.length > 0 ? (
                  <div className="bg-page border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setArticlesExpanded(!articlesExpanded)}
                      aria-expanded={articlesExpanded}
                      aria-controls="articles-list"
                      className="w-full flex items-center justify-between px-4 py-3 text-heading font-semibold hover:bg-card transition-colors"
                    >
                      <span>
                        Articles ({result.articles.length})
                      </span>
                      <svg
                        className={`h-5 w-5 text-muted transition-transform duration-200 ${articlesExpanded ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {articlesExpanded ? (
                      <div id="articles-list" className="divide-y divide-border">
                        {result.articles.map((article) => (
                          <div key={article.url} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-heading font-medium hover:text-accent transition-colors line-clamp-2"
                                >
                                  {article.title}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full border ${getRecommendationStyle(article.sentiment)}`}
                                >
                                  {article.sentiment}
                                </span>
                                <span className="text-sm text-muted font-mono">
                                  {article.sentiment_score.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16 bg-page">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-heading mb-8">
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="card-glow bg-card border border-border rounded-xl p-4 text-center"
              >
                <p className="text-heading font-semibold mb-1">{tech.name}</p>
                <p className="text-muted text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-page">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors font-medium"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to Projects
          </Link>
        </div>
      </section>
    </main>
  );
}
