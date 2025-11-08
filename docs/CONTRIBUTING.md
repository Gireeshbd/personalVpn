# Contributing to Personal VPN

Thank you for your interest in contributing to Personal VPN! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gireeshbd/personalVpn.git
   cd personalVpn
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local` in both `packages/chrome-extension` and `packages/backend-api`
   - Fill in the required values

4. **Start development**
   ```bash
   pnpm dev
   ```

## Project Structure

```text
personalVpn/
├── packages/
│   ├── chrome-extension/    # Chrome extension code
│   ├── backend-api/          # Vercel serverless API
│   ├── infrastructure/       # Infrastructure as code
│   └── shared/               # Shared types and utilities
├── docs/                     # Documentation
├── scripts/                  # Development scripts
└── .github/                  # CI/CD workflows
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new features

3. **Run tests and linting**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Code Style

- Use TypeScript for all new code
- Follow the ESLint and Prettier configurations
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write unit tests for utilities and functions
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Aim for >80% code coverage

## Pull Request Process

1. Ensure all tests pass and code is linted
2. Update documentation if needed
3. Add a clear description of your changes
4. Link any related issues
5. Request review from maintainers
6. Address any feedback

## Questions?

Feel free to open an issue or reach out to the maintainers!
