import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import cx from "classnames";

import styles from "./NodeTypes.module.css";
import usePlaceholderClick from "../hooks/use-placeholder-click";

const PlaceholderNode = ({ id, data }: NodeProps) => {
  // 查看钩子实现以了解点击处理程序的详细信息
  // 调用onClick将此节点和连接边转换为工作流节点
  const onClick = usePlaceholderClick(id);

  const nodeClasses = cx(styles.node, styles.placeholder);

  return (
    <div onClick={onClick} className={nodeClasses} title="click to add a node">
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

export default memo(PlaceholderNode);
