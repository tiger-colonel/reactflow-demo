import { useCallback, useRef, useState } from "react";
import { debounce } from "lodash-es";
import { Edge, Node } from "@xyflow/react";
import { useHistoryStore } from "./HistoryStore";
import { HistoryEvent } from "./type";

export const useHistory = () => {
  const { store } = useHistoryStore();

  const [undoCallbacks, setUndoCallbacks] = useState<any[]>([]);
  const [redoCallbacks, setRedoCallbacks] = useState<any[]>([]);

  const onUndo = useCallback((callback: unknown) => {
    setUndoCallbacks((prev: any) => [...prev, callback]);
    return () =>
      setUndoCallbacks((prev) => prev.filter((cb) => cb !== callback));
  }, []);

  const onRedo = useCallback((callback: unknown) => {
    setRedoCallbacks((prev: any) => [...prev, callback]);
    return () =>
      setRedoCallbacks((prev) => prev.filter((cb) => cb !== callback));
  }, []);

  const undo = useCallback(() => {
    store.temporal.getState().undo();
    undoCallbacks.forEach((callback) => callback());
  }, [undoCallbacks, store.temporal]);

  const redo = useCallback(() => {
    store.temporal.getState().redo();
    redoCallbacks.forEach((callback) => callback());
  }, [redoCallbacks, store.temporal]);

  const saveStateToHistoryRef = useRef(
    debounce((event: HistoryEvent) => {
      store.setState({
        historyEvent: event,
        nodes: store.getState().nodes as Node[],
        edges: store.getState().edges as Edge[],
      });
    }, 500)
  );

  const setHistoryState = (event: HistoryEvent) => {
    switch (event) {
      case HistoryEvent.NodeAdd:
      case HistoryEvent.NodeDelete:
        saveStateToHistoryRef.current(event);
        break;

      default:
        break;
    }
  };

  return {
    undo,
    redo,
    onUndo,
    onRedo,
    setHistoryState,
  };
};
