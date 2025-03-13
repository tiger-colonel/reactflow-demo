import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import cx from "classnames";

import styles from "./NodeTypes.module.css";
import useNodeClickHandler from "../hooks/use-node-click";

const WorkflowNode = ({ id, data }: NodeProps) => {
  // 查看钩子实现以了解点击处理器的详情
  // 调用onClick会为这个节点添加一个子节点
  const onClick = useNodeClickHandler(id);

  return (
    <div
      onClick={onClick}
      className={cx(styles.node)}
      title="click to add a child node"
    >
      {data.label}
      <Handle
        className={styles.handle}
        type="target"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        className={styles.handle}
        type="source"
        position={Position.Bottom}
        isConnectable={false}
      />
    </div>
  );
};

export default memo(WorkflowNode);
