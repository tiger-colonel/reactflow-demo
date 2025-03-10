import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  Panel,
  type Node,
  useStoreApi,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes } from "./nodes";
import { Button } from "antd";

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const { getState } = useStoreApi();
  const handleAdd = useCallback(() => {
    const { nodes } = getState();
    const nodeIdx = nodes.length;
    const newNode: Node = {
      id: `node-${nodeIdx}`,
      type: "default",
      position: { x: 50 * nodeIdx, y: 50 * nodeIdx },
      data: { label: `Node ${nodeIdx}` },
    };
    setNodes((nodes) => nodes.concat([newNode]));
  }, [setNodes, getState]);

  return (
    <div className="h-screen w-screen">
      <ReactFlow nodes={nodes} onNodesChange={onNodesChange} fitView>
        <Panel>
          <Button className="mr-[12px]" type="primary" onClick={handleAdd}>
            添加节点
          </Button>
          <Button className="mr-[12px]" type="primary">
            撤销
          </Button>
          <Button type="primary">重做</Button>
        </Panel>
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
