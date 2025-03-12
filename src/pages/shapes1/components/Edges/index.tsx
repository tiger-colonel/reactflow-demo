import React, { FC } from "react";
import {
  EdgeProps,
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  useNodes,
} from "reactflow";
import { NodeTypeEnum } from "../../constant";

export const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  label,
  source,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const nodes = useNodes();
  const sourceNode = nodes.find((n) => n.id === source);
  const transform =
    sourceNode?.type === NodeTypeEnum.Decision
      ? `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`
      : `translate(-50%, -160%) translate(${targetX}px,${targetY}px)`;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 3 }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: "absolute",
              transform,
              background: "#fff",
              padding: 8,
              borderRadius: 4,
              fontSize: 18,
              fontWeight: 600,
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
