export type NotificationPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type NotificationType =
  | 'TRANSFER'
  | 'INVENTORY'
  | 'RECALL'
  | 'REVOCATION'
  | 'EXPIRY'
  | 'BLOCKCHAIN'
  | 'COMPLIANCE'
  | 'USER'
  | 'SECURITY'
  | 'SYSTEM';

export interface Notification {
  id: string;

  title: string;

  message: string;

  priority: NotificationPriority;

  type: NotificationType;

  isRead: boolean;

  actionUrl?: string;

  metadata?: Record<string, any>;

  createdAt: string;
}