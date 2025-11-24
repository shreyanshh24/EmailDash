import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  if (!html) return "";

  // Create a temporary DOM element to leverage browser's parsing
  if (typeof window !== 'undefined') {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Fallback for server-side (simple regex, though less robust)
  return html.replace(/<[^>]*>?/gm, '');
}
