import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// Internal links go through next/link so they pick up the GitHub Pages base path.
const components: MDXComponents = {
  a: ({ href = "", children, ...rest }) =>
    href.startsWith("/") ? (
      <Link href={href} {...rest}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener" {...rest}>{children}</a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
