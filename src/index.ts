import { test as base } from '@playwright/test';
import { AhemClient } from './ahem-client';
import { Email, EmailFilterOptions, AhemPluginConfig } from './types';

declare module '@playwright/test' {
  interface PlaywrightTestOptions {
    ahem?: AhemPluginConfig;
  }
}

export type AhemEmailFixture = {
  ahemEmail: AhemEmailHelper;
};

export const test = base.extend<AhemEmailFixture>({
  ahemEmail: async ({}, use, testInfo) => {
    const globalConfig = (testInfo.config as any).ahem || {};
    const projectConfig = (testInfo.project.use as any).ahem || {};
    
    const config: AhemPluginConfig = {
      baseUrl: 'http://localhost:3000',
      defaultTimeout: 30000,
      pollInterval: 1000,
      cleanupAfterTest: true,
      defaultMailbox: 'inbox',
      ...globalConfig,
      ...projectConfig
    };

    if (process.env.AHEM_BASE_URL) {
      config.baseUrl = process.env.AHEM_BASE_URL;
    }

    const client = new AhemClient(config.baseUrl);
    await client.authenticate(); // Ensure authenticated session
    const helper = new AhemEmailHelper(client, config);

    await use(helper);

    if (config.cleanupAfterTest) {
      try {
        await helper.deleteAllEmails();
      } catch (error) {
        console.warn('AHEM cleanup error:', error);
      }
    }
  },
});

export class AhemEmailHelper {
  constructor(
    private readonly client: AhemClient,
    private readonly config: AhemPluginConfig
  ) {}

  async waitForEmail(
    options: EmailFilterOptions,
    timeout?: number,
    mailbox: string = this.config.defaultMailbox || 'inbox'
  ): Promise<Email> {
    const startTime = Date.now();
    const timeoutMs = timeout ?? this.config.defaultTimeout ?? 30000; // Default to 30000ms if undefined
    const pollInterval = this.config.pollInterval;

    while (Date.now() - startTime < timeoutMs) {
      const emails = await this.client.searchEmails(mailbox, options);
      
      if (emails.length > 0) {
        if (options.markAsRead !== false) {
          await this.client.markAsRead(mailbox, emails[0].id);
        }
        return emails[0];
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout ${timeoutMs}ms exceeded waiting for email matching: ${JSON.stringify(options)}`);
  }

  async getEmails(
    options?: EmailFilterOptions,
    mailbox: string = this.config.defaultMailbox
  ): Promise<Email[]> {
    return options
      ? this.client.searchEmails(mailbox, options)
      : this.client.listEmails(mailbox);
  }

  async getEmail(
    id: string,
    mailbox: string = this.config.defaultMailbox
  ): Promise<Email> {
    return this.client.getEmail(mailbox, id);
  }

  async deleteEmail(
    id: string,
    mailbox: string = this.config.defaultMailbox
  ): Promise<void> {
    return this.client.deleteEmail(mailbox, id);
  }

  async deleteAllEmails(
    mailbox: string = this.config.defaultMailbox
  ): Promise<void> {
    const emails = await this.client.listEmails(mailbox);
    await Promise.all(emails.map(email => 
      this.client.deleteEmail(mailbox, email.id)
    ));
  }

  async markAsRead(
    id: string,
    read: boolean = true,
    mailbox: string = this.config.defaultMailbox
  ): Promise<void> {
    return this.client.markAsRead(mailbox, id, read);
  }

  async getAttachment(
    emailId: string,
    filename: string,
    mailbox: string = this.config.defaultMailbox
  ): Promise<ArrayBuffer> {
    return this.client.getAttachment(mailbox, emailId, filename);
  }

  async extractLinkFromEmail(
    email: Email,
    text: string
  ): Promise<string> {
    const content = email.html || email.text || '';
    const regex = new RegExp(`(https?://[^\\s"']*${text}[^\\s"']*)`, 'i');
    const match = content.match(regex);
    if (!match?.[1]) throw new Error(`Link containing "${text}" not found`);
    return match[1];
  }

  async extractVerificationCode(email: Email): Promise<string> {
    const code = email.text?.match(/\b\d{4,6}\b/)?.[0];
    if (!code) throw new Error('No verification code found');
    return code;
  }

  async listMailboxes(prefix?: string): Promise<string[]> {
    return this.client.listMailboxes(prefix);
  }

  async deleteMailbox(mailbox: string): Promise<void> {
    return this.client.deleteMailbox(mailbox);
  }
}

export default test;