/**
 • 本示例展示了如何使用自定义节点和边来动态地向你的 React Flow 图中添加元素。  
 • 每当图发生变化时，全局布局函数会计算节点的新位置，并将现有节点动画过渡到新位置。  
 *
 • 有三种方式可以向图中添加节点：  
 •  1. 点击现有节点：为被点击的节点创建一个新的子节点  
 •  2. 点击现有边的加号图标：在边的两个连接节点之间创建一个节点  
 •  3. 点击占位节点：将占位节点转换为“真实”节点，以避免布局跳动  
 *
 • 图元素通过自定义节点和边中的钩子调用添加。每次图发生变化时，都会重新计算布局（参见 hooks/useLayout.ts）。  
 */

import {
  Node,
  Edge,
  ReactFlow,
  Background,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import useLayout from "./hooks/use-layout";
import nodeTypes from "./nodes";
import edgeTypes from "./edges";

// 初始设置：一个工作流节点和一个占位节点
// 占位节点可以通过点击转换为工作流节点
const defaultNodes: Node[] = [
  {
    id: "1",
    data: { label: "🌮 Taco" },
    position: { x: 0, y: 0 },
    type: "workflow",
  },
  {
    id: "2",
    data: { label: "+" },
    position: { x: 0, y: 150 },
    type: "placeholder",
  },
];

// 初始设置：使用占位边将工作流节点连接到占位节点
const defaultEdges: Edge[] = [
  {
    id: "1=>2",
    source: "1",
    target: "2",
    type: "placeholder",
  },
];

const fitViewOptions = {
  padding: 0.95,
};

function ProExampleApp() {
  // 此钩子调用确保每次图发生变化时，布局都会重新计算
  useLayout();

  return (
    <div className="w-screen h-[calc(100vh-56px)]">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={fitViewOptions}
        minZoom={0.2}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        // 将 deleteKeyCode 设置为 null，以防止节点被删除，以保持示例的简洁性。
        // 如果想启用节点删除功能，需要确保图中只有一个根节点。
        deleteKeyCode={null}
      >
        <Background />
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
