import { memo } from "react";
import {
  NodeProps,
  NodeToolbar,
  useReactFlow,
  useStore,
  useStoreApi,
  NodeResizer,
  getNodesBounds,
} from "@xyflow/react";

import useDetachNodes from "../use-detach-nodes";

const lineStyle = { borderColor: "white" };

function GroupNode({ id }: NodeProps) {
  const store = useStoreApi();
  const { deleteElements } = useReactFlow();
  const detachNodes = useDetachNodes();
  const { minWidth, minHeight, hasChildNodes } = useStore((store) => {
    const childNodes = Array.from(store.nodeLookup.values()).filter(
      (n) => n.parentId === id
    );
    const rect = getNodesBounds(childNodes);

    return {
      minWidth: rect.x + rect.width,
      minHeight: rect.y + rect.height,
      hasChildNodes: childNodes.length > 0,
    };
  }, isEqual);

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const onDetach = () => {
    const childNodeIds = Array.from(store.getState().nodeLookup.values())
      .filter((n) => n.parentId === id)
      .map((n) => n.id);

    detachNodes(childNodeIds, id);
  };

  return (
    <div>
      <NodeResizer
        lineStyle={lineStyle}
        minHeight={minHeight}
        minWidth={minWidth}
      />
      <NodeToolbar className="nodrag">
        <button onClick={onDelete}>删除</button>
        {hasChildNodes && <button onClick={onDetach}>解除组</button>}
      </NodeToolbar>
    </div>
  );
}

type IsEqualCompareObj = {
  minWidth: number;
  minHeight: number;
  hasChildNodes: boolean;
};

function isEqual(prev: IsEqualCompareObj, next: IsEqualCompareObj): boolean {
  return (
    prev.minWidth === next.minWidth &&
    prev.minHeight === next.minHeight &&
    prev.hasChildNodes === next.hasChildNodes
  );
}

export default memo(GroupNode);
