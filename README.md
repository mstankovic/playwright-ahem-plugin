# Playwright AHEM Email Plugin

![npm](https://img.shields.io/npm/v/playwright-ahem-plugin)
![License](https://img.shields.io/npm/l/playwright-ahem-plugin)

A Playwright plugin for testing email functionality with the AHEM (Ad Hoc Email Server). Easily intercept, inspect and validate emails in your end-to-end tests.

## Features

- ✉️ **Wait for emails** with configurable timeouts
- 📩 **Extract links** and verification codes from emails
- ⚙️ **Flexible configuration** via Playwright config
- 🔄 **Polling system** for reliable email checks

## Installation

```bash
npm install playwright-ahem-plugin --save-dev
# or
yarn add playwright-ahem-plugin --dev
```

## ⚙️ Configuration

### Setup
```typescript
import { configureAhem } from 'playwright-ahem-plugin';

await configureAhem({
    serverUrl: 'http://ahem.server.rs',  // AHEM server address
    defaultMailbox: 'test-user',         // fallback mailbox (can override per call)
    defaultTimeout: 30000,               // max wait time in ms (optional)
    pollInterval: 3000,                  // polling frequency in ms (optional)
  });
```

## Usage

```typescript
import { test, expect } from '@playwright/test';
import { waitForEmail, deleteMailbox } from 'playwright-ahem-plugin';

test('should receive password reset email and extract link', async () => {
  const email = await waitForEmail({
    subject: /Reset Password/,
    from: 'noreply@yourapp.com',
    // mailbox: 'override-mailbox',     // optional override
    // timeout: 20000,                  // optional override
    // polling: 1000,                   // optional override
  });

  const link = email.extractLink();
  console.log('Extracted link:', link);

  await email.markAsRead();
  await email.delete();

  await deleteMailbox('inbox');
});
```