.PHONY: build dev lint lint-fix format format-check test test-watch check prepublish

build:
	npm run build

dev:
	npm run dev

lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

format-check:
	npm run format:check

test:
	npm test

test-watch:
	npm run test:watch

check: format-check lint test

prepublish:
	npm run prepublishOnly
