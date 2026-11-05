package main

import (
	"context"
	"errors"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"typefast/services/user/internal/account"
	"typefast/services/user/internal/authorization"
	"typefast/services/user/internal/config"
	"typefast/services/user/internal/httpapi"
	"typefast/services/user/internal/login"
	"typefast/services/user/internal/mailer"
	"typefast/services/user/internal/observability"
	"typefast/services/user/internal/outbox"
	"typefast/services/user/internal/recovery"
	"typefast/services/user/internal/register"
	"typefast/services/user/internal/revocation"
	"typefast/services/user/internal/session"
	"typefast/services/user/internal/storage/migrations"
	"typefast/services/user/internal/storage/postgres"
)

func main() {
	if err := run(); err != nil {
		slog.Error("api stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	addr := flag.String("addr", "", "listen address (defaults to :$PORT)")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		return err
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: cfg.LogLevel}))
	logger.Info("starting user api", "env", cfg.Env, "mailer", cfg.Mailer)

	if cfg.JWTKeyIsRandom {
		logger.Warn("JWT_PRIVATE_KEY is not set; using an ephemeral signing key")
	}
	if cfg.Env == "production" && cfg.InternalToken == "" {
		logger.Warn("INTERNAL_SERVICE_TOKEN is not set; internal authorization checks are disabled")
	}
	if cfg.Env == "production" && cfg.Mailer != "smtp" {
		logger.Warn("MAILER is not smtp; production email will only be logged")
	}
	if cfg.Env == "production" && !cfg.CookieSecure {
		logger.Warn("COOKIE_SECURE is false in production")
	}
	if !cfg.RateLimit {
		logger.Warn("rate limiting is disabled")
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if cfg.AutoMigrate {
		if err := migrations.Up(ctx, cfg.DatabaseURL); err != nil {
			return err
		}
		logger.Info("migrations applied")
	}

	store, err := postgres.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer store.Close()

	if err := store.Ping(ctx); err != nil {
		return err
	}

	// Load bans recorded before startup, then keep the snapshot fresh. A failed
	// initial load fails startup rather than serving with unknown revocations.
	revocations := revocation.NewRegistry(store, logger)
	if err := revocations.Refresh(ctx); err != nil {
		return err
	}
	go revocations.Run(ctx, cfg.RevocationRefresh)

	tokens, err := session.NewTokenManager(cfg.JWTPrivateKey, cfg.JWTKeyID, cfg.JWTIssuer, cfg.JWTAudience, cfg.AccessTTL)
	if err != nil {
		return err
	}

	sessionService := session.NewService(store, tokens, cfg.RefreshTTL, store, logger)
	registerService := register.NewService(store, cfg.PublicAppURL, store, logger)
	loginService := login.NewService(store, sessionService, store, logger)
	accountService := account.NewService(store, store, logger)
	recoveryService := recovery.NewService(store, cfg.PublicAppURL, store, logger)
	authorizationService := authorization.NewService(store, store, revocations, logger)

	var sender mailer.Mailer = &mailer.Log{Logger: logger}
	if cfg.Mailer == "smtp" {
		sender = &mailer.SMTP{Addr: cfg.SMTPAddr, From: cfg.MailFrom}
	}

	worker := &outbox.Worker{
		Store:    store,
		Mailer:   sender,
		Logger:   logger,
		Interval: time.Second,
	}
	go worker.Run(ctx)

	metrics := observability.NewPrometheus()
	server := httpapi.New(
		cfg,
		logger,
		store,
		metrics,
		registerService,
		loginService,
		sessionService,
		accountService,
		recoveryService,
		authorizationService,
		tokens,
		revocations,
	)

	listenAddr := *addr
	if listenAddr == "" {
		listenAddr = ":" + cfg.Port
	}

	httpServer := &http.Server{
		Addr:              listenAddr,
		Handler:           server.Routes(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		logger.Info("listening", "addr", listenAddr)
		errCh <- httpServer.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	case <-ctx.Done():
		logger.Info("shutting down")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		return err
	}
	return nil
}
