.PHONY: help dev build test lint clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server
	pnpm dev

build: ## Build for production
	pnpm build

preview: ## Preview production build
	pnpm preview

test: ## Run unit tests
	pnpm test

test-e2e: ## Run E2E tests (Playwright)
	pnpm exec playwright test

lint: ## Lint code
	pnpm lint

lint-fix: ## Auto-fix lint issues
	pnpm lint --fix

format: ## Format code
	pnpm prettier --write "src/**/*.{ts,tsx,scss,css}"

clean: ## Remove build artifacts
	rm -rf dist/
