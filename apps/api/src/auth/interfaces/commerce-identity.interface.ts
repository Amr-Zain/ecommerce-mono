export type CommerceIdentity =
  | { type: 'user'; userId: bigint }
  | { type: 'anonymous'; sessionId: string }
  | { type: 'none' };
