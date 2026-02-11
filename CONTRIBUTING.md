# Contributing to Consultancy Platform

Thank you for your interest in contributing to the Consultancy Platform! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see [Development Guide](./docs/DEVELOPMENT.md))

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/consultancy-platform.git
cd consultancy-platform

# Add upstream remote
git remote add upstream https://github.com/your-org/consultancy-platform.git

# Install dependencies
make setup
```

### Finding Issues to Work On

- Look for issues labeled `good first issue` for beginners
- Check `help wanted` for issues needing assistance
- Ask in discussions before working on major features

## Development Process

### Branch Workflow

We use Git Flow with the following branches:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `hotfix/*` | Urgent production fixes |
| `release/*` | Release preparation |

### Creating a Branch

```bash
# Update your local develop
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bugfixes
git checkout -b bugfix/issue-123-fix-description
```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change that neither fixes nor adds
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality

fix(contact): resolve form validation on mobile

docs(api): update endpoint documentation

refactor(services): extract service creation logic to action
```

### Keep Commits Focused

- One logical change per commit
- Avoid mixing refactoring with features
- Squash WIP commits before PR

## Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run tests**
   ```bash
   make test
   ```

3. **Run linting**
   ```bash
   make lint
   ```

4. **Check for type errors**
   ```bash
   cd frontend && npx tsc --noEmit
   ```

### Submitting a PR

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request against `develop`

3. Fill in the PR template:
   ```markdown
   ## Description
   [Describe your changes]

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### PR Review Process

1. Automated checks must pass
2. At least one maintainer approval required
3. All conversations resolved
4. Branch up to date with `develop`

### After Merge

```bash
# Clean up local branch
git checkout develop
git pull upstream develop
git branch -d feature/your-feature-name

# Clean up remote branch
git push origin --delete feature/your-feature-name
```

## Coding Standards

### PHP (Backend)

We follow PSR-12 with Laravel conventions.

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ServiceInterface;

final class MyService implements ServiceInterface
{
    public function __construct(
        private readonly Repository $repository,
    ) {}

    public function process(array $data): Result
    {
        // Implementation
    }
}
```

**Key Rules:**
- Use strict types
- Type hint everything
- Use readonly properties where applicable
- Prefer composition over inheritance
- Keep methods small and focused

### TypeScript (Frontend)

```typescript
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};
```

**Key Rules:**
- Define interfaces for all props
- Use functional components
- Prefer named exports
- Use meaningful variable names
- Keep components small and focused

### CSS/Tailwind

```tsx
// Prefer Tailwind utility classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// Extract repeated patterns to components
const Card: FC<CardProps> = ({ children, className }) => (
  <div className={cn(
    "bg-white rounded-lg shadow-md p-6",
    className
  )}>
    {children}
  </div>
);
```

## Testing Requirements

### Backend Tests

Every PR should include tests for:
- New features (unit + integration)
- Bug fixes (regression tests)
- Modified behavior

```php
class MyServiceTest extends TestCase
{
    public function test_it_processes_data_correctly(): void
    {
        // Arrange
        $service = new MyService($this->mockRepository);
        $data = ['key' => 'value'];

        // Act
        $result = $service->process($data);

        // Assert
        $this->assertTrue($result->isSuccess());
    }
}
```

### Frontend Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    const onAction = vi.fn();
    render(<MyComponent title="Test" onAction={onAction} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onAction).toHaveBeenCalled();
  });
});
```

### Coverage Requirements

| Type | Minimum Coverage |
|------|-----------------|
| Unit Tests | 80% |
| Integration | Key paths |
| E2E | Critical flows |

## Documentation

### Code Documentation

```php
/**
 * Process a contact submission.
 *
 * @param ContactSubmissionData $data The submission data
 * @return ContactSubmission The created submission
 *
 * @throws ValidationException If data is invalid
 */
public function execute(ContactSubmissionData $data): ContactSubmission
```

### When to Document

- Public APIs and interfaces
- Complex algorithms
- Non-obvious business logic
- Configuration options
- Breaking changes

### API Documentation

Update `docs/API.md` for:
- New endpoints
- Changed request/response formats
- New query parameters
- Deprecated endpoints

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Screenshots
[If applicable]

## Additional Context
[Any other information]
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
[Clear description of the feature]

## Problem It Solves
[What problem does this address?]

## Proposed Solution
[How would you implement it?]

## Alternatives Considered
[Other approaches you've thought about]

## Additional Context
[Any other information]
```

## Questions?

- Check [Development Guide](./docs/DEVELOPMENT.md)
- Ask in GitHub Discussions
- Contact maintainers

---

Thank you for contributing to the Consultancy Platform!
