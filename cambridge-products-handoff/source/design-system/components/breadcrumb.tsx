import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/cn";

export interface BreadcrumbItem {
  href?: string;
  label: string;
}
export interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ className, items, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-2 text-[var(--cambt-color-text-secondary)]">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span aria-hidden="true" className="text-[var(--cambt-color-border-strong)]">
                  /
                </span>
              ) : null}
              {item.href && !current ? (
                <a
                  /* Inline-flex with a 24px floor so the target clears the AA minimum. A
                     breadcrumb is a navigation list, not a link inside prose, so the
                     inline-link exception does not apply to it. */
                  className="inline-flex min-h-11 items-center transition-colors hover:text-[var(--cambt-color-text-primary)]"
                  href={item.href}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={
                    current ? "font-medium text-[var(--cambt-color-text-primary)]" : undefined
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
