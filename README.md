# Playwright AHEM Email Plugin

![npm](https://img.shields.io/npm/v/playwright-ahem-plugin)
![License](https://img.shields.io/npm/l/playwright-ahem-plugin)

A Playwright plugin for testing email functionality with the AHEM (Ad Hoc Email Server). Easily intercept, inspect and validate emails in your end-to-end tests.

## Features

- ✉️ **Wait for emails** with configurable timeouts
- 🔍 **Search emails** by recipient, subject, or content
- 📩 **Extract links** and verification codes from emails
- 🧹 **Automatic cleanup** between tests
- ⚙️ **Flexible configuration** via Playwright config
- 🔄 **Polling system** for reliable email checks

## Installation

```bash
npm install playwright-ahem-plugin --save-dev
# or
yarn add playwright-ahem-plugin --dev
```

## Configuration
Add the plugin to your playwright.config.ts:

```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // ... other config options ...
  
  use: {
    ahem: {
      baseUrl: 'http://localhost:3000', // AHEM server URL
      defaultTimeout: 30000, // Default wait timeout (ms)
      pollInterval: 1000,    // How often to check for new emails (ms)
      cleanupAfterTest: true // Auto-delete emails after each test
    }
  }
};

export default config;
```

## Usage

```typescript
import { test } from 'playwright-ahem-email';

test('password reset flow', async ({ page, ahemEmail }) => {
  // Trigger password reset email
  await page.goto('/forgot-password');
  await page.fill('#email', 'user@example.com');
  await page.click('#submit');

  // Wait for the email to arrive
  const email = await ahemEmail.waitForEmail({
    to: 'user@example.com',
    subject: 'Password Reset'
  });

  // Extract the reset link
  const resetLink = await ahemEmail.extractLinkFromEmail(email, 'reset-password');
  
  // Continue with your test flow
  await page.goto(resetLink);
  // ... complete password reset ...
});
```
## API Reference

### Core Methods:

1. **waitForEmail(options, timeout?)**
```typescript
const email = await ahemEmail.waitForEmail({
  to: 'user@example.com',
  subject: 'Welcome'
}, 15000); // 15s timeout
```

2. **getEmails(options?)**
```typescript
const emails = await ahemEmail.getEmails({
  from: 'no-reply@company.com'
});
```

3. **getEmail(id)**
```typescript
const email = await ahemEmail.getEmail('email-123');
```

4. **extractLinkFromEmail(email, text)**
```typescript
const link = await ahemEmail.extractLinkFromEmail(email, 'verify');
```

5. **extractVerificationCode(email)**
```typescript
const code = await ahemEmail.extractVerificationCode(email);
```

6. **deleteEmail(id)**
```typescript
await ahemEmail.deleteEmail('email-123');
```

7. **deleteAllEmails()**
```typescript
await ahemEmail.deleteAllEmails();
```

### Utility Methods:

8. **listEmails()**
```typescript
const allEmails = await ahemEmail.listEmails();
```

9. **searchEmails(options)**
```typescript
const results = await ahemEmail.searchEmails({
  textContains: 'urgent'
});
```

10. **getLatestEmail()**
```typescript
const latest = await ahemEmail.getLatestEmail();
```

### Types:
```typescript
interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  receivedAt: string;
}

interface EmailFilterOptions {
  from?: string;
  to?: string;
  subject?: string;
  textContains?: string;
  receivedAfter?: Date;
}
```