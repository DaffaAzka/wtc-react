import { useEffect, useRef } from "react";

/**
 * Hook to auto-focus an input element
 * @param shouldFocus - Whether to trigger focus
 * @returns ref to attach to the input element
 */
export function useAutoFocus<T extends HTMLElement = HTMLInputElement>(
  shouldFocus: boolean
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        ref.current?.focus();
        ref.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  }, [shouldFocus]);

  return ref;
}
