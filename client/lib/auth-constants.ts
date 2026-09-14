export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  'skenterprise2k21@gmail.com',
  'sathissk12@gmail.com'
];

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
