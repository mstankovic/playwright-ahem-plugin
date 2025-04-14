import { test as base } from '@playwright/test';
import { AhemClient } from './ahem-client';
import { Email, EmailFilterOptions, AhemPluginConfig } from './types';

// Type extensions for Playwright configuration
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
    // Get configuration from multiple sources with proper fallback
    const globalConfig = (testInfo.config as any).ahem || {};
    const projectConfig = (testInfo.project.use as any).ahem || {};
    
    const config: AhemPluginConfig = {
      baseUrl: 'http://localhost:3000',
      defaultTimeout: 30000,
      pollInterval: 1000,
      cleanupAfterTest: true,
      ...globalConfig,
      ...projectConfig
    };

    // Environment variable override
    if (process.env.AHEM_BASE_URL) {
      config.baseUrl = process.env.AHEM_BASE_URL;
    }

    const client = new AhemClient(config.baseUrl);
    const helper = new AhemEmailHelper(client, config);

    await use(helper);

    // Cleanup after test if configured
    if (config.cleanupAfterTest) {
      try {
        await helper.deleteAllEmails();
      } catch (error) {
        console.warn('Failed to clean up AHEM emails:', error);
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
    timeout?: number
  ): Promise<Email> {
    return this.client.waitForEmail(
      options,
      timeout ?? this.config.defaultTimeout,
      this.config.pollInterval
    );
  }

  async getEmails(options?: EmailFilterOptions): Promise<Email[]> {
    return options
      ? this.client.searchEmails(options)
      : this.client.listEmails();
  }

  async getEmail(id: string): Promise<Email> {
    return this.client.getEmail(id);
  }

  async deleteEmail(id: string): Promise<void> {
    return this.client.deleteEmail(id);
  }

  async deleteAllEmails(): Promise<void> {
    return this.client.deleteAllEmails();
  }

  async extractLinkFromEmail(
    email: Email,
    text: string
  ): Promise<string> {
    const content = email.html || email.text || '';
    const regex = new RegExp(`(https?://[^\\s"']*${text}[^\\s"']*)`, 'i');
    const match = content.match(regex);

    if (!match?.[1]) {
      throw new Error(`No link containing "${text}" found in email`);
    }

    return match[1];
  }

  async extractVerificationCode(email: Email): Promise<string> {
    const codeMatch = email.text?.match(/\b\d{4,6}\b/);
    if (!codeMatch) {
      throw new Error('No verification code found in email');
    }
    return codeMatch[0];
  }
}

export default test;