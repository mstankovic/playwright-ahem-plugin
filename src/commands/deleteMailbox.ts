// src/commands/deleteMailbox.ts
import { AhemClient } from '../api/ahemClient';
import { ahemConfig } from '../config';

export const deleteMailbox = async (mailbox?: string) => {
  const client = new AhemClient(mailbox || ahemConfig.defaultMailbox);
  await client.deleteMailbox();
};
