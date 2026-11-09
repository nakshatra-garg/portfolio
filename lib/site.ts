export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nakshatra-garg.github.io/portfolio").replace(/\/$/, "");
export const CHAT_ENDPOINT = (process.env.NEXT_PUBLIC_CHAT_ENDPOINT ?? "").replace(/\/$/, "");

/** Prefix a file in /public with the base path (plain <a> tags don't get it automatically). */
export const asset = (p: string) => `${BASE_PATH}${p}`;

export const EMAIL = "gargnakshatra11@gmail.com";
export const MAILTO = `mailto:${EMAIL}?subject=Hello%20Nakshatra`;
export const LINKEDIN = "https://www.linkedin.com/in/nakshatra-garg";
export const GITHUB = "https://github.com/nakshatra-garg";
export const RESUME = "/files/Nakshatra_Garg_Resume.pdf";
