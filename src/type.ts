import { Edge, Node } from "@xyflow/react";
import { ReactNode } from "react";
import { TemporalState } from "zundo";
import { StoreApi } from "zustand";

export type HistoryStoreProps = {
  nodes: Node[];
  edges: Edge[];
  children: ReactNode;
};

export enum HistoryEvent {
  NodeDrag = "node-drag",
  NodeAdd = "node-add",
  NodeDelete = "node-delete",
}

export type HistoryStore = {
  nodes: Node[];
  edges: Edge[];
  historyEvent: HistoryEvent | undefined;
};

export type HistoryStoreActions = {
  setNodes?: (nodes: Node[]) => void;
  setEdges?: (edges: Edge[]) => void;
};

export type HistoryState = HistoryStore & HistoryStoreActions;

export type HistoryStoreApi = StoreApi<HistoryStore> & {
  temporal: StoreApi<TemporalState<HistoryState>>;
};
