# Contributing to Abridged

Thank you for your interest in contributing to Abridged! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and constructive in all interactions
- Follow project standards and conventions
- Help maintain code quality and documentation

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm start`
4. **Run tests**: `npm test`

## Development Workflow

### Before You Start

1. Check existing issues and pull requests to avoid duplicates
2. Review [Engineering Standards](docs/development/engineering-standards.md)
3. Read relevant documentation in [docs/](docs/)
4. Ensure your development environment is set up correctly

### Making Changes

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Follow code standards**:
   - TypeScript for all new code
   - Follow existing project structure
   - Use meaningful variable and function names
   - Add JSDoc comments for complex functions
3. **Write or update tests** for your changes
4. **Update documentation** if adding features or changing behavior
5. **Test thoroughly**:
   - Run `npm test` to ensure all tests pass
   - Test on iOS simulator/device
   - Check both light and dark modes
   - Verify accessibility features

### Commit Guidelines

- Use clear, descriptive commit messages
- Format: `type: brief description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat: add swipe gesture to delete saved articles`
  - `fix: resolve tab bar rendering issue in dark mode`
  - `docs: update iOS 26 component documentation`

### Pull Request Process

1. **Update CHANGELOG.md** with your changes under `[Unreleased]`
2. **Ensure tests pass**: `npm test`
3. **Update documentation** if needed
4. **Create a pull request** with:
   - Clear title describing the change
   - Detailed description of what and why
   - Screenshots/videos for UI changes
   - Link to related issues
5. **Address review feedback** promptly
6. **Keep PRs small and version-scoped**: One version bucket per PR (don’t mix future release work). Only bump app/package versions when cutting the release PR, not on feature branches.

## Code Standards

### TypeScript

- Enable strict mode
- Avoid `any` types (use `unknown` if necessary)
- Use interfaces for object shapes
- Export types alongside components

### React Native / React

- Use functional components with hooks
- Follow React Navigation best practices
- Use Context API for global state
- Implement proper error boundaries

### Styling

- Use StyleSheet.create() for styles
- Follow existing theme structure (colors, typography, spacing)
- Support both light and dark modes
- Ensure safe area compatibility

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Use Testing Library patterns
- Mock external dependencies appropriately

## Project Structure

```
src/
├── components/        # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── context/          # React Context providers
├── services/         # API and business logic
├── utils/            # Utility functions
├── theme/            # Design tokens and theme
├── types/            # TypeScript type definitions
└── __tests__/        # Test files
```

## Documentation Standards

- Follow agent-ready format (see iOS 26 docs for examples)
- Include code examples where applicable
- Update docs/ when adding features
- Keep README.md current
- Document breaking changes clearly

## iOS 26 Component Guidelines

When working with iOS 26 UI components:

- Maintain glass morphism aesthetic
- Support both light and dark themes
- Include haptic feedback for interactions
- Use spring physics for animations (damping: 20, stiffness: 300)
- Handle safe areas properly
- Provide Android fallbacks (solid backgrounds instead of blur)
- Follow prominence patterns (standard, tinted, filled, destructive)

See [docs/ios26/ios26-ui-components.md](docs/ios26/ios26-ui-components.md) for details.

## Accessibility Requirements

- Support Dynamic Type (scalable text)
- Ensure sufficient color contrast
- Add meaningful accessibility labels
- Test with VoiceOver
- Support reduced motion preferences
- Use semantic HTML elements (for web)

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Device/OS information
- App version

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Related features or dependencies

Use GitHub issue templates when available.

## Questions?

- Check [docs/](docs/) for documentation
- Review existing issues and discussions
- Contact: contact@mcc-cal.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Abridged! 🎉
