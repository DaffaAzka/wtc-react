import { useEffect } from "react";

type KeyboardShortcutsProps = {
  isEnabled: boolean;
  onDuplicate: () => void;
  onAddQuestion: () => void;
  onEscape?: () => void;
};

/**
 * Hook for keyboard shortcuts in Challenge Builder
 * @param isEnabled - Whether shortcuts are enabled (modal is open)
 * @param onDuplicate - Handler for Ctrl+D (duplicate active question)
 * @param onAddQuestion - Handler for Ctrl+Enter (add new question)
 * @param onEscape - Optional handler for Escape key
 */
export function useKeyboardShortcuts({
  isEnabled,
  onDuplicate,
  onAddQuestion,
  onEscape,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl + D - Duplicate active question
      if (e.ctrlKey && e.key === "d" && !isInputField) {
        e.preventDefault();
        onDuplicate();
      }

      // Ctrl + Enter - Add new question
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        onAddQuestion();
      }

      // Escape - Close dialog/modal
      if (e.key === "Escape" && onEscape) {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabled, onDuplicate, onAddQuestion, onEscape]);
}
