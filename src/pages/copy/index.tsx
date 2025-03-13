import React, { useCallback } from "react";
import {
  Node,
  Edge,
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  Panel,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import styles from "./styles.module.css";
import useCopyPaste from "./use-copy-paste";

const initialNodes: Node[] = [
  {
    id: "a",
    className: styles.node,
    data: { label: "A" },
    position: { x: 0, y: 0 },
  },
  {
    id: "b",
    className: styles.node,
    data: { label: "B" },
    position: { x: 0, y: 100 },
  },
  {
    id: "c",
    className: styles.node,
    data: { label: "C" },
    position: { x: 0, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: "a->b", source: "a", target: "b" },
  { id: "b->c", source: "b", target: "c" },
];

const fitViewOptions = { padding: 1 };

function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(addEdge(params, edges)),
    [edges]
  );

  const { cut, copy, paste, bufferedNodes } = useCopyPaste();

  const canCopy = nodes.some(({ selected }) => selected);
  const canPaste = bufferedNodes.length > 0;

  return (
    <div className="w-screen h-[calc(100vh-56px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
      >
        <Panel className={styles.buttonGroup} position="top-left">
          <button
            className={styles.button}
            onClick={() => cut()}
            disabled={!canCopy}
          >
            cut
          </button>
          <button
            className={styles.button}
            onClick={() => copy()}
            disabled={!canCopy}
          >
            copy
          </button>
          <button
            className={styles.button}
            onClick={() => paste({ x: 0, y: 0 })}
            disabled={!canPaste}
          >
            paste
          </button>
        </Panel>
        <Background />
      </ReactFlow>
    </div>
  );
}

function CopyPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default CopyPage;
