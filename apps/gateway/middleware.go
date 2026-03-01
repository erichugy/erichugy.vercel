package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// ---- CORS Middleware ----

// CORSMiddleware reads ALLOWED_ORIGINS (comma-separated) from the environment
// and sets the appropriate CORS headers. Preflight OPTIONS requests are handled
// directly with a 204 response.
func CORSMiddleware(next http.Handler) http.Handler {
	raw := os.Getenv("ALLOWED_ORIGINS")
	allowed := map[string]bool{}
	if raw != "" {
		for _, origin := range strings.Split(raw, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowed[origin] = true
			}
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// If the origin is in the allow-list, reflect it back.
		if origin != "" && (allowed[origin] || allowed["*"]) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		// Handle preflight.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// ---- Request Logging Middleware ----

// statusRecorder wraps http.ResponseWriter to capture the status code.
type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (sr *statusRecorder) WriteHeader(code int) {
	sr.statusCode = code
	sr.ResponseWriter.WriteHeader(code)
}

// Flush implements http.Flusher so WebSocket/streaming proxying works.
func (sr *statusRecorder) Flush() {
	if f, ok := sr.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// Hijack implements http.Hijacker so WebSocket upgrades work.
func (sr *statusRecorder) Hijack() (c interface{}, brw interface{}, err error) {
	// We need the real Hijack signature; delegate via type assertion.
	return nil, nil, http.ErrNotSupported
}

// LoggingMiddleware logs each request's method, path, status code, and duration
// to stdout.
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rec, r)
		duration := time.Since(start)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, rec.statusCode, duration)
	})
}

// ---- Rate Limiting Middleware ----

// tokenBucket implements a simple per-IP token bucket rate limiter.
type tokenBucket struct {
	tokens     float64
	maxTokens  float64
	refillRate float64 // tokens per second
	lastRefill time.Time
}

func (tb *tokenBucket) allow() bool {
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.tokens += elapsed * tb.refillRate
	if tb.tokens > tb.maxTokens {
		tb.tokens = tb.maxTokens
	}
	tb.lastRefill = now

	if tb.tokens >= 1 {
		tb.tokens--
		return true
	}
	return false
}

// RateLimitMiddleware enforces a simple in-memory token bucket per client IP.
// Defaults: 100 requests burst, 10 requests/second refill.
func RateLimitMiddleware(next http.Handler) http.Handler {
	var mu sync.Mutex
	buckets := map[string]*tokenBucket{}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)

		mu.Lock()
		b, exists := buckets[ip]
		if !exists {
			b = &tokenBucket{
				tokens:     100,
				maxTokens:  100,
				refillRate: 10,
				lastRefill: time.Now(),
			}
			buckets[ip] = b
		}
		allowed := b.allow()
		mu.Unlock()

		if !allowed {
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// clientIP extracts the client IP from the request, checking X-Forwarded-For
// first, then falling back to RemoteAddr.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Take the first IP in the chain.
		if idx := strings.Index(xff, ","); idx != -1 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}
	// RemoteAddr is "ip:port"; strip port.
	addr := r.RemoteAddr
	if idx := strings.LastIndex(addr, ":"); idx != -1 {
		return addr[:idx]
	}
	return addr
}

// Chain applies middleware in order (outermost first).
func Chain(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}
