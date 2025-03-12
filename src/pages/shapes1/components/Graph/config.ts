import {
  AssignmentNode,
  ProcessNode,
  SwitchNode,
  DecisionNode,
} from "../Nodes";

import CustomEdge from "../Edges";

// 自定义节点
export const nodeTypes = {
  AssignmentNode,
  ProcessNode,
  SwitchNode,
  DecisionNode,
};

// 自定义连线
export const edgeTypes = {
  custom: CustomEdge,
};

export const fitViewOptions = {
  padding: 0.5,
};
