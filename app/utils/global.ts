export function getSecureRandomNumber(min: number, max: number) {
  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error("Secure random number generator is not available.");
  }

  if (max < min) {
    throw new Error(
      "Maximum value must be greater than or equal to minimum value.",
    );
  }

  const range = max - min + 1;
  const maxUint32 = 0xffffffff;
  const limit = Math.floor(maxUint32 / range) * range;
  const randomValues = new Uint32Array(1);

  let randomValue = 0;
  do {
    globalThis.crypto.getRandomValues(randomValues);
    randomValue = randomValues[0];
  } while (randomValue >= limit);

  return min + (randomValue % range);
}

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
      .replace(/^-+|-+$/g, "") + `-${getSecureRandomNumber(1000, 9999)}`
  );
}
