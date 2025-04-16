export interface EmailSummary {
    emailId: string;
    subject: string;
    sender: { address: string; name: string };
    timestamp: number;
    isRead: boolean;
  }
  
  export interface EmailContent {
    _id: string;
    subject: string;
    html?: string;
    text?: string;
    timestamp: number;
  }
  