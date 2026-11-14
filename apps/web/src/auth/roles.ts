export const role = () =>
  localStorage.getItem('role');

export const isAdmin = () =>
  role() === 'SUPER_ADMIN';

export const isRegulator = () =>
  role() === 'REGULATOR';

export const isManufacturer = () =>
  role() === 'MANUFACTURER';

export const isDistributor = () =>
  role() === 'DISTRIBUTOR';

export const isPharmacy = () =>
  role() === 'PHARMACY';