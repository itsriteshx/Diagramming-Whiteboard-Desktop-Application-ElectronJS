// src/hooks/useHistory.js
import { useState, useCallback } from 'react';

/**
 * 🌟 VIVA CORE CONCEPT: Stack-Based Undo/Redo Engine
 * 
 * Data Structure: Two Stacks (pastStack, futureStack)
 * 1. Action perform hone par present state pastStack mein push hoti hai aur futureStack clear hota hai.
 * 2. Undo (Ctrl+Z): pastStack se pop karo, present ko futureStack mein dalo.
 * 3. Redo (Ctrl+Y): futureStack se pop karo, present ko pastStack mein dalo.
 */
export function useHistory(initialPresent) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialPresent);
  const [future, setFuture] = useState([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setPast((prevPast) => {
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [present, ...prevFuture]);
      setPresent(previous);

      return newPast;
    });
  }, [canUndo, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setFuture((prevFuture) => {
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast((prevPast) => [...prevPast, present]);
      setPresent(next);

      return newFuture;
    });
  }, [canRedo, present]);

  const set = useCallback(
    (newPresentOrUpdater) => {
      setPresent((currentPresent) => {
        const nextPresent =
          typeof newPresentOrUpdater === 'function'
            ? newPresentOrUpdater(currentPresent)
            : newPresentOrUpdater;

        // Push current into past, clear future
        setPast((prevPast) => [...prevPast, currentPresent]);
        setFuture([]);

        return nextPresent;
      });
    },
    []
  );

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
