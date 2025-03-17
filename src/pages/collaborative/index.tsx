import { DragEvent, useCallback } from "react";
import {
  ReactFlow,
  Node,
  ReactFlowProvider,
  Controls,
  useReactFlow,
  NodeMouseHandler,
  OnConnect,
  addEdge,
} from "@xyflow/react";

import useCursorStateSynced from "./hooks/use-cursor-state-synced";
import useEdgesStateSynced from "./hooks/use-edges-state-synced";
import useNodesStateSynced from "./hooks/use-nodes-state-synced";
import Cursors from "./components/cursors";
import Sidebar from "./components/sidebar";

import "@xyflow/react/dist/style.css";
import "./index.css";

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

function ReactFlowPro() {
  const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
  const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
  const [cursors, onMouseMove] = useCursorStateSynced();
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((prev) => addEdge(params, prev));
    },
    [setEdges]
  );

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/reactflow");
    const position = screenToFlowPosition({
      x: event.clientX - 80,
      y: event.clientY - 20,
    });
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position,
      data: { label: `${type}` },
    };

    setNodes((prev) => [...prev, newNode]);
  };

  // 点击事件添加一个闪烁效果，并在 3 秒后移除, 帮助用户直观地看到某个节点被其他用户点击
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, clicked) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === clicked.id ? { ...node, className: "blink" } : node
        )
      );

      window.setTimeout(() => {
        setNodes((prev) =>
          prev.map((node) =>
            node.id === clicked.id ? { ...node, className: undefined } : node
          )
        );
      }, 3000);
    },
    [setNodes]
  );

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="react-flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPointerMove={onMouseMove}
        >
          <Cursors cursors={cursors} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Flow() {
  return (
    <ReactFlowProvider>
      <ReactFlowPro />
    </ReactFlowProvider>
  );
}
