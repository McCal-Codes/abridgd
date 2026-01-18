# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in Abridged, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@mcc-cal.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information (optional, for follow-up)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 1 week
- **Status Updates**: Regular updates on progress
- **Resolution**: Coordinated disclosure after fix is deployed

### Security Best Practices

This project follows these security practices:

1. **Dependency Management**
   - Regular dependency updates
   - Monitoring npm audit reports
   - Reviewing security advisories

2. **Data Protection**
   - No sensitive data stored unencrypted
   - Secure AsyncStorage usage
   - HTTPS-only API communications (when implemented)

3. **Authentication** (when implemented)
   - OAuth/Sign in with Apple for authentication
   - No passwords stored locally
   - Secure token management

4. **Code Review**
   - All changes reviewed before merge
   - Security-focused review for sensitive areas
   - Automated testing for regressions

### Known Security Considerations

**Current State (v1.1.0)**:
- App currently uses mock data (no external API calls)
- No user authentication implemented yet
- No sensitive user data collected
- All data stored locally via AsyncStorage

**Future Considerations**:
- RSS feed parsing security (XSS prevention)
- API authentication when backend implemented
- User data privacy when accounts added
- Content Security Policy for web version

### Third-Party Dependencies

We use Sentry for error tracking. See their privacy policy: https://sentry.io/privacy/

Current dependency vulnerabilities (as of 2026-01-18):
- 17 low-severity vulnerabilities in dev dependencies
- 0 high/critical vulnerabilities in production code
- Primarily in `eas-cli` and `@oclif` packages (build-time only)

### Security Updates

Security updates will be:
- Released as patch versions (e.g., 1.1.1)
- Documented in CHANGELOG.md
- Communicated to beta testers via TestFlight notes

## Responsible Disclosure

We follow responsible disclosure practices:

1. **Report received** → Acknowledge within 48 hours
2. **Vulnerability confirmed** → Develop fix
3. **Fix tested** → Deploy to production
4. **Public disclosure** → After fix is live (coordinated with reporter)

Thank you for helping keep Abridged secure!

---

Last updated: 2026-01-18
