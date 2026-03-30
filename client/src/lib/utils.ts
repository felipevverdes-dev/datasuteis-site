import { twMerge } from "tailwind-merge";

type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function flattenClasses(value: ClassValue, output: string[]) {
  if (!value) {
    return;
  }

  if (typeof value === "string" || typeof value === "number") {
    output.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => flattenClasses(item, output));
    return;
  }

  Object.entries(value).forEach(([className, enabled]) => {
    if (enabled) {
      output.push(className);
    }
  });
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];
  inputs.forEach((input) => flattenClasses(input, classes));
  return twMerge(classes.join(" "));
}
