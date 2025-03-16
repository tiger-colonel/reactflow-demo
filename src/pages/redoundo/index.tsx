import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Node,
  useStoreApi,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes } from "./nodes";
import { Button, Flex } from "antd";
import { useHistory } from "./use-history";
import { HistoryEvent } from "./type";
import useHistoryStore, { HistoryProvider } from "./history-store";

// ### 撤销（Undo）

// - **定义**：撤销是指撤回上一步或多步的操作。它允许用户恢复到之前的状态。
// - **应用场景**：例如，当你在文本编辑器中输入错误的内容、删除了某个段落或更改了格式后，使用撤销可以恢复到操作之前的状态。
// - **常用快捷键**：通常在大多数应用程序中，撤销的快捷键是 **Ctrl + Z**（在 Mac 上为 **Command + Z**）。

// ### 重做（Redo）

// - **定义**：重做是指将刚刚撤销的操作重新应用。它允许用户恢复到撤销之前的状态。
// - **应用场景**：例如，如果你撤销了某个操作后，发现其实是想保留这个改变，那么可以使用重做来恢复该操作。
// - **常用快捷键**：通常在大多数应用程序中，重做的快捷键是 **Ctrl + Y** 或 **Ctrl + Shift + Z**（在 Mac 上为 **Command + Shift + Z**）

const Flow = ({ initialNodes }: { initialNodes: Node[] }) => {
  const { getState } = useStoreApi();
  const { store: historyStore } = useHistoryStore();
  const { setNodes } = getState();

  const { redo, undo, setHistoryState } = useHistory();

  const handleAdd = useCallback(() => {
    const { nodes } = getState();
    const nodeIdx = nodes.length;
    const newNode: Node = {
      id: `node-${nodeIdx}`,
      type: "default",
      position: { x: 50 * nodeIdx, y: 50 * nodeIdx },
      data: { label: `Node ${nodeIdx}` },
    };

    const newNodes = nodes.concat([newNode]);
    setNodes(newNodes);

    setHistoryState(HistoryEvent.NodeAdd);
  }, [setNodes, getState, setHistoryState]);

  const handleHistoryBack = useCallback(() => {
    undo();
    const { nodes } = historyStore.getState();
    console.log("nodes back=========>", nodes);
    setNodes(nodes);
  }, [undo, setNodes, historyStore]);

  const handleForward = useCallback(() => {
    redo();
    const { nodes } = historyStore.getState();
    console.log("nodes forward=========>", nodes);
    setNodes(nodes);
  }, [redo, setNodes, historyStore]);

  return (
    <div className="w-screen h-[calc(100vh-56px)]">
      <HistoryProvider nodes={initialNodes} edges={[]}>
        <ReactFlow nodes={initialNodes} fitView>
          <Panel>
            <Flex gap={12}>
              <Button type="primary" onClick={handleAdd}>
                添加节点
              </Button>
              <Button type="primary" onClick={handleHistoryBack}>
                撤销
              </Button>
              <Button type="primary" onClick={handleForward}>
                重做
              </Button>
            </Flex>
          </Panel>
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </HistoryProvider>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <HistoryProvider nodes={initialNodes} edges={[]}>
        <Flow initialNodes={initialNodes} />
      </HistoryProvider>
    </ReactFlowProvider>
  );
}
