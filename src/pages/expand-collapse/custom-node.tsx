import { MouseEventHandler } from "react";
import { Handle, NodeProps, Position, useReactFlow } from "@xyflow/react";

import styles from "./styles.module.css";

type GetLabelParams = {
  expanded: boolean;
  expandable: boolean;
};

// 根据当前状态返回节点的标签
function getLabel({ expanded, expandable }: GetLabelParams): string {
  if (!expandable) {
    return "nothing to expand";
  }

  return expanded ? "Click to collapse ▲" : "Click to expand ▼";
}

export default function CustomNode({
  data,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps) {
  const { addNodes, addEdges } = useReactFlow();

  const addChildNode: MouseEventHandler = (evt) => {
    //  当节点处于展开状态时添加新节点，阻止其展开/折叠行为
    if (data.expanded) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    const newNodeId = `${id}__${new Date().getTime()}`;

    // the edge between the clicked node and the child node is created
    addNodes({
      id: newNodeId,
      position: { x: positionAbsoluteX, y: positionAbsoluteY + 100 },
      data: { label: "X" },
    });
    addEdges({ id: `${id}->${newNodeId}`, source: id, target: newNodeId });
  };

  const label = getLabel(data as GetLabelParams);

  return (
    <div className={styles.node}>
      <div className={styles.label}>{label}</div>
      <Handle position={Position.Top} type="target" />
      <Handle position={Position.Bottom} type="source" />
      <div className={styles.button} onClick={addChildNode}>
        + add child node
      </div>
    </div>
  );
}
