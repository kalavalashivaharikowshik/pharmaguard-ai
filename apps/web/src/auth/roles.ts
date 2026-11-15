export type AppRole = 'SUPER_ADMIN' | 'REGULATOR' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'PHARMACY' | 'HOSPITAL';

export const role = () => localStorage.getItem('role');

export const isAdmin = () => role() === 'SUPER_ADMIN';
export const isRegulator = () => role() === 'REGULATOR';
export const isManufacturer = () => role() === 'MANUFACTURER';
export const isDistributor = () => role() === 'DISTRIBUTOR';
/** Hospitals have the same dispensing permissions as pharmacies. */
export const isPharmacy = () => role() === 'PHARMACY' || role() === 'HOSPITAL';
export const isHospital = () => role() === 'HOSPITAL';
export const isOversight = () => isAdmin() || isRegulator();

/**
 * True when the current user has one of the roles. A HOSPITAL user is
 * allowed wherever PHARMACY is allowed (same RBAC row in the permission table).
 */
export function hasRole(roles: string[]): boolean {
  const r = role();
  if (!r) return false;
  if (roles.includes(r)) return true;
  return r === 'HOSPITAL' && roles.includes('PHARMACY');
}

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  REGULATOR: 'Regulator',
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  PHARMACY: 'Pharmacy',
  HOSPITAL: 'Hospital',
};
