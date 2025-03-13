import { EdgeProps, getBezierPath } from "@xyflow/react";

import useEdgeClick from "../hooks/use-edge-click";
import styles from "./EdgeTypes.module.css";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // 有关实现细节，请参见钩子
  // onClick 会在由该边连接的两个节点之间添加一个节点
  const onClick = useEdgeClick(id);

  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className={styles.edgePath}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <g transform={`translate(${edgeCenterX}, ${edgeCenterY})`}>
        <rect
          onClick={onClick}
          x={-10}
          y={-10}
          width={20}
          ry={4}
          rx={4}
          height={20}
          className={styles.edgeButton}
        />
        <text className={styles.edgeButtonText} y={5} x={-4}>
          +
        </text>
      </g>
    </>
  );
}
