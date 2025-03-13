import { NodeTypes } from "@xyflow/react";

import PlaceholderNode from "./PlaceholderNode";
import WorkflowNode from "./WorkflowNode";

const nodeTypes: NodeTypes = {
  placeholder: PlaceholderNode,
  workflow: WorkflowNode,
};

export default nodeTypes;
