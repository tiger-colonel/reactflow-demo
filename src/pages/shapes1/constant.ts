/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-object-types */
import { Node, Edge, ReactFlowInstance } from "reactflow";

export const rcBgProps = {
  color: "#81818a", // variant 图案颜色
  variant: "dots", // 'lines' | 'dots' | 'cross'
  gap: 25,
  size: 2,
  lineWidth: 1,
  offset: 2,
  style: {
    backgroundColor: "rgba(243,244,244,0.8)",
  },
};

export enum NodeTypeEnum {
  Decision = "DecisionNode",
  Process = "ProcessNode",
  Switch = "SwitchNode",
  Assignment = "AssignmentNode",
  Edge = "edge",
}

export const initNodeSize = {
  width: 200,
  height: 100,
};

export type CustomNodeProps = {
  data: INodeData;
  id: string;
  isConnectable: boolean;
  selected: boolean;
};

export const JsonTypeList = [
  { label: "number", value: "number" },
  { label: "string", value: "string" },
  { label: "boolean", value: "boolean" },
];

export const BooleanList = [
  { label: "True", value: "True" },
  { label: "False", value: "False" },
];

export interface INodeData {
  width?: number;
  height?: number;
  label?: string;
  name?: string;
  // If 节点
  eval_str?: string | string[];
  // function节点
  func?: string;
  args?: string[];
  context?: boolean;
  // assignment节点
  outputType?: string;
  outputValue?: any;
  varStr?: string;
  [key: string]: any;
}

export interface IEdgeData {
  edgeLabelType?: string;
}

export enum SelectedTypeEnum {
  Node = "node",
  Edge = "edge",
}

export interface ISelectedNode {
  type: SelectedTypeEnum;
  value: Node<INodeData> | Edge;
}

export type IContextItem = {
  id?: string;
  label?: string;
  varStr?: string;
  outputType?: string;
  outputValue?: string;
  args?: string[];
};

export type FlowItem = {
  id: string;
  flow: string;
  flow_layout: string;
};

export type FlowInfoType = {
  id: string;
  argList: string[];
  contextList: IContextItem[];
  processName: string;
  returnList: string[];
  nodes: Node<INodeData>[];
  edges: Edge[];
};

export interface ISideStore {
  argList: string[];
  contextList: IContextItem[];
  returnList: string[];
}

export type GlobalInfoType = {
  default_args: string[];
  modules: { name: string; args: string[] }[];
};

export interface IFlowProps {
  instance?: ReactFlowInstance;
  setInstance?: (instance: ReactFlowInstance) => void;
  flowList?: FlowInfoType[];
  globalInfo?: GlobalInfoType;
  setFlowList?: (flowList: FlowInfoType[]) => void;
  setGlobalInfo?: (globalInfo: GlobalInfoType) => void;
  flowInfo?: FlowInfoType;
  setFlowInfo?: (flowInfo: FlowInfoType) => void;
  sideStore?: ISideStore;
  setSideStore?: (sideStore: ISideStore) => void;
  lock?: boolean;
  setLock?: (lock: boolean) => void;
  selectedNode?: ISelectedNode;
  setSelectedNode?: (selectedNode: ISelectedNode) => void;
  getFlowList?: () => void;
  getGlobalInfo?: () => void;
}
