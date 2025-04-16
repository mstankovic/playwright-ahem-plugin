export const config = {
    serverUrl: '',
    token: '',
    defaultMailbox: '',
    defaultTimeout: 20000,
    pollInterval: 3000,
  };
  
  export async function configureAhem({
    serverUrl,
    defaultMailbox,
    defaultTimeout,
    pollInterval,
  }: {
    serverUrl: string;
    defaultMailbox?: string;
    defaultTimeout?: number;
    pollInterval?: number;
  }) {
    config.serverUrl = serverUrl;
    if (defaultMailbox) config.defaultMailbox = defaultMailbox;
    if (defaultTimeout) config.defaultTimeout = defaultTimeout;
    if (pollInterval) config.pollInterval = pollInterval;
  
    return authenticate();
  }
  
  import { authenticate } from './auth';
  