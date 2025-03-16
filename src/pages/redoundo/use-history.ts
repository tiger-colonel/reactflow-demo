import { useCallback, useRef, useState } from "react";
import { debounce } from "lodash-es";
import { Edge, Node, useStoreApi } from "@xyflow/react";
import useHistoryStore from "./history-store";
import { HistoryEvent } from "./type";

export const useHistory = () => {
  const { store: historyStore } = useHistoryStore();
  const store = useStoreApi();

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
    historyStore.temporal.getState().undo();
    undoCallbacks.forEach((callback) => callback());
  }, [undoCallbacks, historyStore.temporal]);

  const redo = useCallback(() => {
    historyStore.temporal.getState().redo();
    redoCallbacks.forEach((callback) => callback());
  }, [redoCallbacks, historyStore.temporal]);

  const saveStateToHistoryRef = useRef(
    debounce((event: HistoryEvent) => {
      historyStore.setState({
        historyEvent: event,
        nodes: store.getState().nodes as Node[],
        edges: store.getState().edges as Edge[],
      });
    }, 500)
  );

  const setHistoryState = (event: HistoryEvent) => {
    console.log("event=========>", event);
    switch (event) {
      case HistoryEvent.NodeAdd:
        saveStateToHistoryRef.current(event);
        break;
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
