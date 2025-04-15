export interface AhemConfig {
    baseUrl: string;
    defaultTimeout: number;
    pollInterval: number;
    defaultMailbox: string;
  }
  
  export let ahemConfig: AhemConfig;
  
  export const setAhemConfig = (config: Partial<AhemConfig>) => {
    ahemConfig = {
      baseUrl: config.baseUrl!,
      defaultTimeout: config.defaultTimeout ?? 30000,
      pollInterval: config.pollInterval ?? 1000,
      defaultMailbox: config.defaultMailbox ?? 'inbox',
    };
  };
  