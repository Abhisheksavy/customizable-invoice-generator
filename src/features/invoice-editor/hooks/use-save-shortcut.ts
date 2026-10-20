"use client";

import { useEffect, useEffectEvent } from "react";

/** Runs `onSave` on Cmd/Ctrl+S instead of opening the browser's "Save page" dialog. */
export function useSaveShortcut(onSave: () => void) {
  const save = useEffectEvent(onSave);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
