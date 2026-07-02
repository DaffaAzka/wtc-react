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
    return (
      words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
    );
  }
}