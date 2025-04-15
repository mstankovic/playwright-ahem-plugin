export interface AhemEmailMeta {
    emailId: string;
    subject: string;
    timestamp: number;
    isRead: boolean;
    sender: {
      address: string;
      name: string;
    };
  }
  
  export interface AhemEmailFull {
    _id: string;
    subject: string;
    html?: string;
    text?: string;
    textAsHtml?: string;
    date: string;
    timestamp: number;
    attachments: any[];
  
    from: {
      value: { address: string; name: string }[];
      text: string;
      html: string;
    };
  
    to: {
      value: { address: string; name: string }[];
      text: string;
      html: string;
    };
  
    headers: Record<string, any>;
    headerLines: { key: string; line: string }[];
    messageId: string;
  }
  