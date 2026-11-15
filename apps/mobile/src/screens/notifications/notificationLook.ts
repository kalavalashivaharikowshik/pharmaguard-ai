import type { IconName, Tone } from '../../ui/components';

export function notificationLook(type: string, priority: string): { icon: IconName; tone: Tone } {
  const tone: Tone = priority === 'CRITICAL' || priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'primary';
  const icon: Record<string, IconName> = {
    TRANSFER: 'truck-fast-outline',
    INVENTORY: 'package-variant',
    RECALL: 'shield-alert-outline',
    REVOCATION: 'shield-off-outline',
    EXPIRY: 'calendar-clock',
    BLOCKCHAIN: 'link-variant',
    COMPLIANCE: 'clipboard-check-outline',
    USER: 'account-outline',
    SECURITY: 'lock-outline',
    SYSTEM: 'information-outline',
  };
  return { icon: icon[type] ?? 'bell-outline', tone };
}
