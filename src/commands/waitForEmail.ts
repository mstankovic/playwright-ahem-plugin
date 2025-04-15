import { AhemClient } from '../api/ahemClient';
import { Email } from '../models/Email';
import { ahemConfig } from '../config';
import { sleep } from '../utils/polling';
import type { AhemEmailMeta } from '../types';

interface WaitForEmailOptions {
  subject?: RegExp;
  from?: string;
  timeout?: number;
  pollInterval?: number;
  mailbox?: string;
  match?: (email: AhemEmailMeta) => boolean;
}

export const waitForEmail = async (options: WaitForEmailOptions = {}): Promise<Email> => {
  const {
    subject,
    from,
    timeout = ahemConfig.defaultTimeout,
    pollInterval = ahemConfig.pollInterval,
    mailbox = ahemConfig.defaultMailbox,
    match
  } = options;

  const client = new AhemClient(mailbox);
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const emails: AhemEmailMeta[] = await client.getEmails();
    const matched = emails.find((email) => {
      if (match) return match(email);
      const subjectMatch = subject ? subject.test(email.subject) : true;
      const fromMatch = from ? email.sender.address === from : true;
      return subjectMatch && fromMatch;
    });

    if (matched) {
      const full = await client.getEmailContent(matched.emailId);
      return new Email(full, mailbox);
    }

    await sleep(pollInterval);
  }

  throw new Error(`No matching email found in "${mailbox}" within ${timeout}ms`);
};
