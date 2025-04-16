import { listEmails } from './mailbox';
import { getEmail, markAsRead, deleteEmail } from './email';
import { EmailContent, EmailSummary } from './types';
import { config } from './config';

function matches(
  email: EmailSummary,
  filters: { subject?: RegExp; from?: string }
): boolean {
  const subjectMatch = filters.subject ? filters.subject.test(email.subject) : true;
  const fromMatch = filters.from ? email.sender.address === filters.from : true;
  return subjectMatch && fromMatch;
}

export async function waitForEmail(options: {
  subject?: RegExp;
  from?: string;
  mailbox?: string;
  polling?: number;
  timeout?: number;
}) {
  const {
    subject,
    from,
    mailbox,
    polling = config.pollInterval,
    timeout = config.defaultTimeout,
  } = options;

  const mbox = mailbox || config.defaultMailbox;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const emails = await listEmails(mbox);
    const match = emails.find((e) => matches(e, { subject, from }));
    if (match) {
      const content = await getEmail(match.emailId, mbox);
      return wrapEmail(match.emailId, content, mbox);
    }
    await new Promise((res) => setTimeout(res, polling));
  }

  throw new Error(`No matching email found in ${timeout}ms`);
}

function wrapEmail(emailId: string, content: EmailContent, mailbox?: string) {
  return {
    ...content,
    emailId,
    extractLink(): string {
      const body = content.html || content.text || '';
      const match = body.match(/https?:\/\/[^\s"']+/);
      if (!match) throw new Error('No link found in email body');
      return match[0];
    },
    async markAsRead() {
      await markAsRead(emailId, mailbox);
    },
    async delete() {
      await deleteEmail(emailId, mailbox);
    },
  };
}
