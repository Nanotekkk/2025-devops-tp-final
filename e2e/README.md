# E2E Tests - Christmas Gift List

End-to-end test suite using Playwright to validate user flows and application functionality.

## Tech Stack

- **Playwright** - Modern end-to-end testing framework
- **TypeScript** - Type-safe test authoring

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- **Running frontend and backend servers** (required for tests to pass (you can use a docker-compose for that))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install Playwright and all required browsers.

### 2. Install Playwright Browsers (if needed)

If browsers weren't installed automatically:

```bash
npx playwright install
```

### 3. Start Application Servers

Before running tests, ensure both the frontend and backend are running:

**Terminal 1 - Backend:**

```bash
cd ../backend
go run cmd/server/main.go
```

**Terminal 2 - Frontend:**

```bash
cd ../frontend
npm run dev
```

The tests expect:

- Frontend at `http://localhost:5173`
- Backend at `http://localhost:8080`

### 4. Run E2E Tests

```bash
npm test
```

## Available Commands

```bash
npm test                # Run E2E tests in headless mode
npm run test:headed     # Run tests in headed mode (see browser)
npm run test:ui         # Run tests with Playwright UI
npm run report          # Show HTML test report
npm run codegen         # Open Playwright codegen tool
```

## Test Structure

```
e2e/
├── tests/
│   └── gift-list.spec.ts    # Main test suite
├── playwright.config.ts      # Playwright configuration
└── package.json             # Dependencies and scripts
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test("test description", async ({ page }) => {
  // Navigate to page
  await page.goto("http://localhost:5173");

  // Interact with elements
  await page.click("button");

  // Assert expectations
  await expect(page.locator("h1")).toBeVisible();
});
```

### Example Test

See `tests/gift-list.spec.ts` for complete examples of:

- Adding people
- Adding gifts
- Selecting gifts
- Deleting items
- Form validation

## Configuration

### Playwright Configuration

The `playwright.config.ts` file contains:

- Browser configuration (Chromium, Firefox, WebKit)
- Base URL settings
- Screenshot and video options
- Test timeout settings
- Retry configuration

### Key Settings

```typescript
{
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
}
```

## Running Tests

### Headless Mode (CI/Default)

```bash
npm test
```

Runs tests in the background without opening a browser window. Fastest option for CI/CD.

### Headed Mode (See Browser)

```bash
npm run test:headed
```

Opens browser windows so you can see tests executing in real-time. Useful for debugging.

### UI Mode (Interactive)

```bash
npm run test:ui
```

Opens Playwright's interactive UI for:

- Running tests individually
- Watching test execution
- Time travel debugging
- Viewing traces and screenshots

### Debug Mode

```bash
npx playwright test --debug
```

Runs tests with Playwright Inspector for step-by-step debugging.

### Specific Test File

```bash
npx playwright test gift-list.spec.ts
```

### Specific Test

```bash
npx playwright test -g "test name pattern"
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run report
```

This opens an interactive report showing:

- Test results (pass/fail)
- Screenshots on failure
- Execution time
- Trace files (if enabled)

## Debugging Tests

### 1. Use Headed Mode

```bash
npm run test:headed
```

### 2. Use UI Mode

```bash
npm run test:ui
```

### 3. Add Debug Points

```typescript
await page.pause(); // Pauses test execution
```

### 4. View Screenshots

Screenshots are automatically captured on failure in `test-results/` directory.

### 5. View Traces

Enable trace recording in config and view with:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## Best Practices

### 1. Use Locators Wisely

```typescript
// Good - Resilient locators
await page.getByRole("button", { name: "Submit" });
await page.getByLabel("Username");
await page.getByTestId("submit-button");

// Avoid - Brittle locators
await page.locator(".btn-submit"); // CSS class might change
```

### 2. Wait for Elements

```typescript
// Playwright auto-waits, but for custom scenarios:
await expect(page.getByText("Success")).toBeVisible();
await page.waitForSelector('[data-testid="result"]');
```

### 3. Isolate Tests

Each test should be independent:

```typescript
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto("/");
});
```

### 4. Use Fixtures

```typescript
import { test as base } from "@playwright/test";

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup authenticated session
    await use(page);
  },
});
```

## CI/CD Integration

### Environment Variables

Set these in CI environment:

```bash
CI=true                          # Enables CI-specific settings
PLAYWRIGHT_BROWSERS_PATH=0       # Install browsers in node_modules
```

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: cd e2e && npm ci

- name: Install Playwright Browsers
  run: cd e2e && npx playwright install --with-deps

- name: Run E2E tests
  run: cd e2e && npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: e2e/playwright-report/
```

## Troubleshooting

### Tests Fail with "Connection Refused"

- Ensure frontend is running at `http://localhost:5173`
- Ensure backend is running at `http://localhost:8080`
- Check for port conflicts

### Browser Not Found

```bash
npx playwright install
```

### Tests Timeout

- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 60000, // 60 seconds
  ```
- Check if application is slow to load
- Verify network conditions

### Flaky Tests

- Add explicit waits: `await expect(locator).toBeVisible()`
- Use `waitForLoadState`: `await page.waitForLoadState('networkidle')`
- Increase retries in config

### Different Results Locally vs CI

- Check environment variables
- Verify browser versions
- Review CI-specific config settings
- Check for timing issues (CI might be slower)

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [Playwright CI Guide](https://playwright.dev/docs/ci)

## Contributing

When adding E2E tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add comments for complex interactions
4. Ensure tests are isolated and can run in any order
5. Test both happy paths and error cases
6. Keep tests focused on user flows, not implementation details

## License

See root project README for license information.
