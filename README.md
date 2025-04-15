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

### Basic Setup (playwright.config.ts)
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    ahem: {
      baseUrl: 'https://ahem.server.rs',      // Your AHEM server
      defaultTimeout: 30000,                  // How long to wait for an email
      pollInterval: 1000,                     // How frequently to check for email
      defaultMailbox: 'inbox'                 // Default mailbox to watch
    }
  }
});
```

## Usage

```typescript
import { test, expect } from '@playwright/test';
import { waitForEmail, deleteMailbox } from 'playwright-ahem-plugin';

test('should receive password reset email and extract link', async () => {
  const email = await waitForEmail({
    subject: /Reset Password/,
    mailbox: 'test-user' //optional: override default mailbox
  });

  const link = email.extractLink();  //get first link from body
  console.log('Extracted reset link:', link);

  await email.markAsRead();          //mark as read
  await email.delete();              //delete this specific email

  // Optional cleanup
  await deleteMailbox('test-user');  //delete entire mailbox
});
```

Optional custom match:
```typescript
const email = await waitForEmail({
  match: (email) => email.sender.address === 'noreply@techtailors.rs' && email.subject.includes('Confirm')
});
```

Auto-cleanup After Tests (Optional):
```typescript
import { test } from '@playwright/test';
import { deleteMailbox } from 'playwright-ahem-plugin';

test.afterEach(async () => {
  await deleteMailbox(); //Uses defaultMailbox from config
});
```

