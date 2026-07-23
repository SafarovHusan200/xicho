export const HAZARDOUS_INSPECTOR_ROLE = 'hazardous-facilities-inspector';
export const HAZARDOUS_RESPONSIBLE_ROLE = 'hazardous-facilities-responsible_persons';

// Admin and inspector can create/update/delete across the dashboard; everyone else
// (e.g. a responsible person) is read-only.
export function hasManageAccess(session) {
  if (!session?.user) return false;
  if (session.user.isAdmin) return true;
  return (session.user.roles ?? []).includes(HAZARDOUS_INSPECTOR_ROLE);
}
