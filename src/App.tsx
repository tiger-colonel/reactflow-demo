import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import { Button, Flex } from "antd";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const handleAdd = () => {
    console.log("123=========>", 123);
    const newNode: Node = {
      id: `node-${Math.random().toString(36).substring(7)}`,
      type: "default",
      position: { x: 50, y: 50 },
      data: { label: "Custom Node" },
    };
    setNodes((nodes) => nodes.concat([newNode]));
  };

  const handleDragEnd = (e, node) => {
    console.log("nds=========>", node);
  };

  return (
    <div className="h-screen w-screen">
      <Flex
        align="center"
        justify="space-start"
        gap={24}
        className="h-[54px] w-full px-[24px] absolute top-0 z-[99]"
        style={{
          background: "#EBF7F8",
        }}
      >
        <Button type="primary" onClick={handleAdd}>
          添加节点
        </Button>
        <Button type="primary">撤销</Button>
        <Button type="primary">重做</Button>
      </Flex>
      <ReactFlow
        nodes={nodes}
        // nodeTypes={nodeTypes}
        // onNodeDragStop={onNodesChange}
        onNodeDragStop={handleDragEnd}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
