# ============================================
# DuelCode - Makefile for Docker orchestration
# ============================================

# Default target
.DEFAULT_GOAL := help

# ============================================
# Colors
# ============================================
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============================================
# Help
# ============================================
.PHONY: help
help:
	@echo ""
	@echo "$(BLUE)DuelCode - Docker Orchestration$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@echo "  $(YELLOW)make build$(NC)          Build all Docker images"
	@echo "  $(YELLOW)make up$(NC)             Start all services"
	@echo "  $(YELLOW)make down$(NC)           Stop all services"
	@echo "  $(YELLOW)make restart$(NC)       Restart all services"
	@echo "  $(YELLOW)make logs$(NC)           View logs (all services)"
	@echo "  $(YELLOW)make logs-f$(NC)         View logs (follow mode)"
	@echo "  $(YELLOW)make status$(NC)         Show container status"
	@echo "  $(YELLOW)make clean$(NC)          Remove all containers and volumes"
	@echo "  $(YELLOW)make rebuild$(NC)       Rebuild and restart"
	@echo ""
	@echo "$(GREEN)Individual services:$(NC)"
	@echo "  $(YELLOW)make up-backend$(NC)     Start only backend"
	@echo "  $(YELLOW)make up-frontend$(NC)    Start only frontend"
	@echo "  $(YELLOW)make up-node$(NC)        Start only judge service"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  $(YELLOW)make dev$(NC)             Start in development mode"
	@echo "  $(YELLOW)make shell SERVICE=name$(NC)  Open shell in container"
	@echo ""

# ============================================
# Build
# ============================================
.PHONY: build
build:
	@echo "$(GREEN)Building all Docker images...$(NC)"
	docker compose build

# ============================================
# Start/Stop
# ============================================
.PHONY: up
up:
	@echo "$(GREEN)Starting all services...$(NC)"
	docker compose up -d
	@echo ""
	@echo "$(GREEN)Services started!$(NC)"
	@echo "$(BLUE)Frontend:    http://localhost:80$(NC)"
	@echo "$(BLUE)Backend:     http://localhost:8080$(NC)"
	@echo "$(BLUE)Judge API:   http://localhost:3001$(NC)"
	@echo "$(BLUE)MySQL:       localhost:3306$(NC)"
	@echo "$(BLUE)Redis:       localhost:6379$(NC)"

.PHONY: down
down:
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker compose down

.PHONY: restart
restart:
	$(MAKE) down
	$(MAKE) up

# ============================================
# Logs
# ============================================
.PHONY: logs
logs:
	docker compose logs --tail=100

.PHONY: logs-f
logs-f:
	docker compose logs -f

# ============================================
# Status
# ============================================
.PHONY: status
status:
	@docker compose ps

# ============================================
# Clean
# ============================================
.PHONY: clean
clean:
	@echo "$(RED)WARNING: This will remove all containers and volumes!$(NC)"
	@echo "Type 'yes' to confirm:"
	@read confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker compose down -v; \
		echo "$(GREEN)Clean complete!$(NC)"; \
	else \
		echo "$(YELLOW)Aborted.$(NC)"; \
	fi

.PHONY: clean-images
clean-images:
	@echo "$(RED)Removing all DuelCode images...$(NC)"
	docker rmi duelcode-backend duelcode-frontend duelcode-judge-service 2>/dev/null || true
	docker rmi $$(docker images -q 'duelcode-*') 2>/dev/null || true

# ============================================
# Rebuild
# ============================================
.PHONY: rebuild
rebuild: down build up

# ============================================
# Individual services
# ============================================
.PHONY: up-backend
up-backend:
	docker compose up -d mysql redis backend

.PHONY: up-frontend
up-frontend:
	docker compose up -d frontend

.PHONY: up-node
up-node:
	docker compose up -d node-backend

# ============================================
# Shell access
# ============================================
.PHONY: shell
shell:
	@if [ -z "$(SERVICE)" ]; then \
		echo "$(RED)Usage: make shell SERVICE=backend$(NC)"; \
		echo "$(YELLOW)Available services: backend, node-backend, mysql, redis, frontend$(NC)"; \
	else \
		docker compose exec $(SERVICE) sh; \
	fi

# ============================================
# Development (with hot reload)
# ============================================
.PHONY: dev
dev:
	@echo "$(YELLOW)Starting development environment...$(NC)"
	@echo "$(YELLOW)Note: This requires local Node.js and Java installations$(NC)"
	@echo ""
	@echo "Backend (Java):  cd backend && ./mvnw spring-boot:run"
	@echo "Frontend:       cd frontend && npm run dev"
	@echo "Node Judge:      cd node_backend && node src/judge.js"
