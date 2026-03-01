package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

// ServiceRoute defines a mapping from a URL path prefix to a backend service.
type ServiceRoute struct {
	Prefix    string
	TargetURL *url.URL
}

// RegisterRoutes reads environment variables and builds the route table.
// To add a new service, add an entry to the serviceEnvMap below and set the
// corresponding environment variable.
func RegisterRoutes() []ServiceRoute {
	// Map of path prefix -> environment variable name.
	// Add new services here:
	serviceEnvMap := map[string]string{
		"/api/services/trading-bot/": "TRADING_BOT_URL",
		// "/api/services/example/": "EXAMPLE_SERVICE_URL",
	}

	var routes []ServiceRoute
	for prefix, envVar := range serviceEnvMap {
		rawURL := os.Getenv(envVar)
		if rawURL == "" {
			log.Printf("WARN: env var %s not set, skipping route %s", envVar, prefix)
			continue
		}
		target, err := url.Parse(rawURL)
		if err != nil {
			log.Printf("ERROR: invalid URL for %s (%s): %v", envVar, rawURL, err)
			continue
		}
		routes = append(routes, ServiceRoute{Prefix: prefix, TargetURL: target})
		log.Printf("Registered route: %s -> %s", prefix, rawURL)
	}
	return routes
}

// NewServiceProxy creates a reverse proxy for the given target URL.
// It strips the service prefix from the request path before forwarding.
func NewServiceProxy(prefix string, target *url.URL) http.Handler {
	proxy := &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			// Strip the service prefix so the backend sees a clean path.
			// e.g. /api/services/trading-bot/analyze -> /analyze
			originalPath := req.URL.Path
			req.URL.Path = strings.TrimPrefix(originalPath, strings.TrimSuffix(prefix, "/"))
			if req.URL.Path == "" {
				req.URL.Path = "/"
			}

			// Preserve raw query string.
			req.URL.RawQuery = req.URL.RawQuery
		},
	}
	return proxy
}

// BuildMux constructs the HTTP mux with all registered service routes and the
// health check endpoint. The health handler receives the route list so it can
// aggregate downstream health.
func BuildMux(routes []ServiceRoute) *http.ServeMux {
	mux := http.NewServeMux()

	// Register service proxy routes.
	for _, route := range routes {
		handler := NewServiceProxy(route.Prefix, route.TargetURL)
		mux.Handle(route.Prefix, handler)
	}

	// Health check endpoint.
	mux.HandleFunc("/health", HealthHandler(routes))

	return mux
}
