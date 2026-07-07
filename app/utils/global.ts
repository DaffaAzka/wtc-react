export function firstCharacterUppercase(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getTwoInitials(str: string) {
  if (!str) return str;
  const words = str.split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }
}

export function permissionAllowed(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole);
}

export function getFieldError(
  errors: Record<string, string[]> | null | undefined,
  field: string,
): string | null {
  return errors?.[field]?.[0] ?? null;
}

export function generateSlug(str: string) {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + `-${Math.floor(Math.random() * 10000)}`
  );
}
