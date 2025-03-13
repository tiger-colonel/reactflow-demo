import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Edge,
  Node,
  MiniMap,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  NodeMouseHandler,
  OnEdgesChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import CustomNode from "./custom-node";
import {
  nodes as initialNodes,
  edges as initialEdges,
} from "./initial-elements";

import styles from "./styles.module.css";
import useExpandCollapse from "./use-expand-collapse";
import useAnimatedNodes from "./use-animated-nodes";

const nodeTypes = {
  custom: CustomNode,
};

function ProExampleApp() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(
    nodes,
    edges
  );
  const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes, {
    animationDuration: 300,
  });

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: { ...n.data, expanded: !n.data.expanded },
            };
          }

          return n;
        })
      );
    },
    [setNodes]
  );

  return (
    <div className="w-screen h-[calc(100vh-56px)]">
      <ReactFlow
        fitView
        nodes={animatedNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        className={styles.viewport}
        zoomOnDoubleClick={false}
        elementsSelectable={false}
      >
        <Background />
        <MiniMap zoomable draggable />
      </ReactFlow>
    </div>
  );
}

function ProExampleWrapper() {
  return (
    <ReactFlowProvider>
      <ProExampleApp />
    </ReactFlowProvider>
  );
}

export default ProExampleWrapper;
