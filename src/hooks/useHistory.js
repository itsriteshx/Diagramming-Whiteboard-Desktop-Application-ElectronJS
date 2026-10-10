import { useState, useCallback } from 'react';

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
