export const extractLinkFromEmail = (emailBody: string, pattern: RegExp = /https?:\/\/\S+/): string => {
    const match = emailBody.match(pattern);
    if (!match) throw new Error('No link found in email body.');
    return match[0];
  };
  