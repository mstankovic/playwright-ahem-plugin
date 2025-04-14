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

## ⚙️ Configuration

### Basic Setup (playwright.config.ts)
```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    ahem: {
      baseUrl: 'http://localhost:3000', // AHEM server URL
      defaultTimeout: 30000,           // Default wait timeout (ms)
      pollInterval: 1000,              // Email check frequency (ms)
      cleanupAfterTest: true,          // Auto-delete emails after tests
      defaultMailbox: 'inbox'          // Default mailbox for operations
    }
  }
};
```

## Usage

```typescript
import { test } from 'playwright-ahem-plugin';

test('verify welcome email', async ({ page, ahemEmail }) => {
  // Trigger email sending
  await page.goto('/signup');
  await page.fill('#email', 'test@example.com');
  await page.click('#submit');

  // Wait for email with exact subject
  const email = await ahemEmail.waitForEmail({
    from: 'test@example.com',
    subject: 'Welcome to Our Service',
    textContains: 'verify your account'
  });

  // Assert email content
  expect(email.text).toContain('Thank you for signing up');
});

test('password reset', async ({ page, ahemEmail }) => {
  await page.goto('/forgot-password');
  await page.fill('#email', 'user@example.com');
  await page.click('#submit');

  // Wait for email with timeout override (60s)
  const email = await ahemEmail.waitForEmail(
    { subject: 'Password Reset', to: 'user@example.com' },
    60000
  );

  // Extract and use reset link
  const resetLink = await ahemEmail.extractLinkFromEmail(email, 'reset-password');
  await page.goto(resetLink);
  await page.fill('#new-password', 'secure123');
  await page.click('#submit');

  await expect(page).toHaveURL('/dashboard');
});

test('receipt with attachment', async ({ ahemEmail }) => {
  const email = await ahemEmail.waitForEmail({
    subject: 'Your Receipt'
  });

  // Download PDF attachment
  const pdfBuffer = await ahemEmail.getAttachment(
    email.id,
    'invoice.pdf'
  );

  // Verify attachment
  expect(pdfBuffer.byteLength).toBeGreaterThan(1000);
  expect(isValidPDF(pdfBuffer)).toBeTruthy();
});


Copy
test('2FA verification', async ({ page, ahemEmail }) => {
  await page.goto('/enable-2fa');
  await page.click('#request-code');

  const email = await ahemEmail.waitForEmail({
    subject: 'Your Verification Code'
  });

  // Extract and use 6-digit code
  const code = await ahemEmail.extractVerificationCode(email);
  await page.fill('#verification-code', code);
  await page.click('#verify');

  await expect(page.getByText('2FA Enabled')).toBeVisible();
});

test('complex email validation', async ({ ahemEmail }) => {
  // Wait for email with multiple conditions
  const email = await ahemEmail.waitForEmail({
    from: 'billing@company.com',
    subject: 'Invoice',
    textContains: '$42.50',
    receivedAfter: new Date(Date.now() - 3600000) // last hour
  }, 45000); // 45s timeout

  // Mark as unread after verification
  await ahemEmail.markAsRead(email.id, false);
});
```
## API Reference

### Core Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| **waitForEmail** | `options: EmailFilterOptions`<br>`timeout?: number` (default: config value)<br>`mailbox?: string` (default: config value) | `Promise<Email>` | Waits for an email matching criteria with polling |
| **getEmails** | `options?: EmailFilterOptions`<br>`mailbox?: string` (default: config value) | `Promise<Email[]>` | Retrieves filtered emails from mailbox |
| **getEmail** | `id: string`<br>`mailbox?: string` (default: config value) | `Promise<Email>` | Gets specific email by ID |
| **deleteEmail** | `id: string`<br>`mailbox?: string` (default: config value) | `Promise<void>` | Deletes specific email |
| **deleteAllEmails** | `mailbox?: string` (default: config value) | `Promise<void>` | Deletes all emails in mailbox |
| **markAsRead** | `id: string`<br>`read: boolean = true`<br>`mailbox?: string` (default: config value) | `Promise<void>` | Updates email read status |
| **getAttachment** | `emailId: string`<br>`filename: string`<br>`mailbox?: string` (default: config value) | `Promise<ArrayBuffer>` | Downloads email attachment |
| **extractLinkFromEmail** | `email: Email`<br>`text: string` | `Promise<string>` | Extracts URL containing text |
| **extractVerificationCode** | `email: Email` | `Promise<string>` | Extracts 4-6 digit code |
| **listMailboxes** | `prefix?: string` | `Promise<string[]>` | Lists mailboxes by prefix |
| **deleteMailbox** | `mailbox: string` | `Promise<void>` | Deletes entire mailbox |

### Supporting Types

#### `EmailFilterOptions`
| Property | Type | Description |
|----------|------|-------------|
| from | `string?` | Sender email address |
| to | `string?` | Recipient email address |
| subject | `string?` | Email subject (partial match) |
| textContains | `string?` | Text in plaintext body |
| htmlContains | `string?` | Text in HTML body |
| receivedAfter | `Date?` | Emails after timestamp |
| isRead | `boolean?` | Read/unread status |
| markAsRead | `boolean?` | Auto-mark as read (waitForEmail only) |

#### `Email`
| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Unique email ID |
| from | `string` | Sender address |
| to | `string[]` | Recipient addresses |
| subject | `string` | Email subject |
| text | `string?` | Plaintext content |
| html | `string?` | HTML content |
| attachments | `Array<Attachment>` | File attachments |
| isRead | `boolean` | Read status |
| receivedAt | `string` | ISO timestamp |

#### `Attachment`
| Property | Type | Description |
|----------|------|-------------|
| filename | `string` | Attachment name |
| contentType | `string` | MIME type |
| size | `number` | File size in bytes |

### Example Usage
```typescript
// Using multiple methods together
const email = await ahemEmail.waitForEmail({
  subject: 'Invoice',
  textContains: 'USD 199.00'
}, 45000, 'billing');

const pdf = await ahemEmail.getAttachment(email.id, 'invoice.pdf');
await ahemEmail.markAsRead(email.id, true, 'billing');
```