export interface Notification {

  id: string;

  title: string;

  message: string;

  type:
    | 'TRANSFER'
    | 'RECALL'
    | 'EXPIRY'
    | 'REVOCATION'
    | 'BLOCKCHAIN'
    | 'COMPLIANCE'
    | 'USER'
    | 'SECURITY'
    | 'SYSTEM';

  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';

  isRead: boolean;

  actionUrl?: string;

  metadata?: Record<string, unknown>;

  createdAt: string;

}