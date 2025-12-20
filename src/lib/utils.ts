export function cn(...inputs: (string | undefined)[]) {
  return inputs.filter((i) => !!i).join(" ");
}
