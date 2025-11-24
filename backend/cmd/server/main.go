package main

import (
	"log"
	"net/http"
	"os"

	"github.com/anthonyquere/christmas-gift-list/internal/database"
	"github.com/anthonyquere/christmas-gift-list/internal/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Create tables if they don't exist
	if err := database.CreateTables(); err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	// Create handlers
	personHandler := handlers.NewPersonHandler()
	giftHandler := handlers.NewGiftHandler()

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Route("/api", func(r chi.Router) {
		// People routes
		r.Route("/people", func(r chi.Router) {
			r.Get("/", personHandler.GetAll)
			r.Post("/", personHandler.Create)
			r.Get("/{id}", personHandler.GetByID)
			r.Delete("/{id}", personHandler.Delete)

			// Gifts for a person
			r.Get("/{personId}/gifts", giftHandler.GetByPersonID)
			r.Post("/{personId}/gifts/{giftId}/select", giftHandler.SelectGift)
		})

		// Gift routes
		r.Route("/gifts", func(r chi.Router) {
			r.Post("/", giftHandler.Create)
			r.Patch("/{id}", giftHandler.Update)
			r.Delete("/{id}", giftHandler.Delete)
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Server failed:", err)
	}
}
