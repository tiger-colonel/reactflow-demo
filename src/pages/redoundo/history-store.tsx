import { createContext, useContext, useMemo, useState } from "react";
import { HistoryState, HistoryStoreApi, HistoryStoreProps } from "./type";
import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { temporal } from "zundo";

type HistoryStoreContextType = {
  store: ReturnType<typeof createStore> | null;
};
const HistoryContext = createContext<HistoryStoreContextType>({
  store: null,
});

export const HistoryProvider = ({
  nodes,
  edges,
  children,
}: HistoryStoreProps) => {
  const [store] = useState(() => createStore({ nodes, edges }));

  return (
    <HistoryContext.Provider value={{ store }}>
      {children}
    </HistoryContext.Provider>
  );
};

function createStore({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}): HistoryStoreApi {
  const store = create(
    temporal<HistoryState>((set, get) => {
      return {
        historyEvent: undefined,
        nodes,
        edges,
        getNodes: () => {
          return get().nodes;
        },
        setNodes: (nodes) => {
          set({ nodes });
        },
        setEdges: (edges) => {
          set({ edges });
        },
      };
    })
  );
  return store;
}

export default function useHistoryStore() {
  const { store } = useContext(HistoryContext);

  if (!store) {
    throw new Error("useHistoryStore must be used within a HistoryProvider");
  }
  return {
    store: useMemo(() => {
      return {
        getState: store.getState,
        setState: (state: HistoryState) => {
          store.setState({
            historyEvent: state.historyEvent,
            // NOTE: 可以自定义更新 node、edge 的逻辑
            nodes: state.nodes,
            edges: state.edges,
          });
        },
        subscribe: store.subscribe,
        temporal: store.temporal,
      };
    }, [store]),
  };
}
