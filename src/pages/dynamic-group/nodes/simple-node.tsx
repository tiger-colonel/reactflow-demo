import { memo } from "react";
import {
  Handle,
  Position,
  NodeToolbar,
  NodeProps,
  useStore,
  useReactFlow,
} from "@xyflow/react";

import useDetachNodes from "../use-detach-nodes";

function SimpleNode({ id, data }: NodeProps) {
  const hasParent = useStore((store) => !!store.nodeLookup.get(id)?.parentId);
  const { deleteElements } = useReactFlow();
  const detachNodes = useDetachNodes();

  const onDelete = () => deleteElements({ nodes: [{ id }] });
  const onDetach = () => detachNodes([id]);

  return (
    <>
      <NodeToolbar className="nodrag">
        <button onClick={onDelete}>删除</button>
        {hasParent && <button onClick={onDetach}>分离</button>}
      </NodeToolbar>
      <Handle type="target" position={Position.Left} />
      <div className="icon">△</div>
      <div className="label">{data?.label as string}</div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(SimpleNode);
