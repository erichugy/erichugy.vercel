package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Build route table from environment variables.
	routes := RegisterRoutes()
	log.Printf("Gateway starting with %d registered service(s)", len(routes))

	// Build the HTTP mux with service routes and health endpoint.
	mux := BuildMux(routes)

	// Apply middleware chain (outermost first): logging -> CORS -> rate limiting.
	handler := Chain(mux,
		LoggingMiddleware,
		CORSMiddleware,
		RateLimitMiddleware,
	)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine.
	go func() {
		log.Printf("Gateway listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown: wait for SIGTERM or SIGINT.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	sig := <-quit
	log.Printf("Received signal %s, shutting down gracefully...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Graceful shutdown failed: %v", err)
	}
	log.Println("Gateway stopped")
}

// HealthHandler returns an http.HandlerFunc that reports gateway health and
// aggregated health of all registered backend services.
func HealthHandler(routes []ServiceRoute) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type serviceHealth struct {
			Name    string `json:"name"`
			URL     string `json:"url"`
			Healthy bool   `json:"healthy"`
			Error   string `json:"error,omitempty"`
		}

		services := make([]serviceHealth, 0, len(routes))
		allHealthy := true
		client := &http.Client{Timeout: 3 * time.Second}

		for _, route := range routes {
			sh := serviceHealth{
				Name: route.Prefix,
				URL:  route.TargetURL.String(),
			}
			healthURL, _ := url.JoinPath(route.TargetURL.String(), "health")
			resp, err := client.Get(healthURL)
			if err != nil {
				sh.Healthy = false
				sh.Error = err.Error()
				allHealthy = false
			} else {
				resp.Body.Close()
				sh.Healthy = resp.StatusCode >= 200 && resp.StatusCode < 300
				if !sh.Healthy {
					sh.Error = fmt.Sprintf("status %d", resp.StatusCode)
					allHealthy = false
				}
			}
			services = append(services, sh)
		}

		status := "healthy"
		if !allHealthy {
			status = "degraded"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   status,
			"services": services,
		})
	}
}
