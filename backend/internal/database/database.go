package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func CreateTables() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	ctx := context.Background()

	// Create uuid-ossp extension
	_, err := DB.Exec(ctx, `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
	if err != nil {
		return fmt.Errorf("failed to create uuid-ossp extension: %w", err)
	}

	// Create people table
	_, err = DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS people (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create people table: %w", err)
	}

	// Create gifts table
	_, err = DB.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS gifts (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			is_selected BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create gifts table: %w", err)
	}

	// Create indexes
	_, err = DB.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_gifts_person_id ON gifts(person_id)`)
	if err != nil {
		return fmt.Errorf("failed to create idx_gifts_person_id index: %w", err)
	}

	_, err = DB.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_gifts_is_selected ON gifts(is_selected)`)
	if err != nil {
		return fmt.Errorf("failed to create idx_gifts_is_selected index: %w", err)
	}

	log.Println("Tables created successfully")
	return nil
}

func Connect() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		panic("environment variable DATABASE_URL is not set")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return fmt.Errorf("failed to parse database URL: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	DB = pool
	log.Println("Successfully connected to database")
	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
