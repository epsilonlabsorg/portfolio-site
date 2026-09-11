import { useEffect } from "react";

// Keyboard navigation stays immediate; pointer interactions get visual feedback.
export function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const keyboard = () => {
      root.dataset.keyboard = "true";
    };
    const pointer = () => {
      delete root.dataset.keyboard;
    };
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("pointerdown", pointer, true);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
      document.removeEventListener("pointerdown", pointer, true);
      delete root.dataset.keyboard;
    };
  }, []);
}
