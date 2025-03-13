import { useState, useCallback, useEffect, useRef } from "react";
import {
  Node,
  useKeyPress,
  useReactFlow,
  getConnectedEdges,
  KeyCode,
  Edge,
  XYPosition,
  useStore,
} from "@xyflow/react";

export const useCopyPaste = () => {
  const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 });
  const rfDomNode = useStore((state) => state.domNode);

  const { getNodes, setNodes, getEdges, setEdges, screenToFlowPosition } =
    useReactFlow();

  // 设置粘贴缓冲区以存储复制的节点和边。
  const [bufferedNodes, setBufferedNodes] = useState([] as Node[]);
  const [bufferedEdges, setBufferedEdges] = useState([] as Edge[]);

  // 初始化复制/粘贴hook
  // 1. 移除原生的复制/粘贴/剪切处理程序
  // 2. 添加鼠标移动处理程序以跟踪当前鼠标位置
  useEffect(() => {
    const events = ["cut", "copy", "paste"];

    if (rfDomNode) {
      const preventDefault = (e: Event) => e.preventDefault();

      const onMouseMove = (event: MouseEvent) => {
        mousePosRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
      };

      for (const event of events) {
        rfDomNode.addEventListener(event, preventDefault);
      }

      rfDomNode.addEventListener("mousemove", onMouseMove);

      return () => {
        for (const event of events) {
          rfDomNode.removeEventListener(event, preventDefault);
        }

        rfDomNode.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [rfDomNode]);

  // 复制处理程序
  const copy = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const selectedEdges = getConnectedEdges(selectedNodes, getEdges()).filter(
      (edge) => {
        const isExternalSource = selectedNodes.every(
          (n) => n.id !== edge.source
        );
        const isExternalTarget = selectedNodes.every(
          (n) => n.id !== edge.target
        );

        return !(isExternalSource || isExternalTarget);
      }
    );

    setBufferedNodes(selectedNodes);
    setBufferedEdges(selectedEdges);
  }, [getNodes, getEdges, setBufferedNodes, setBufferedEdges]);

  // 粘贴处理程序
  const paste = useCallback(
    (
      { x: pasteX, y: pasteY } = screenToFlowPosition({
        x: mousePosRef.current.x,
        y: mousePosRef.current.y,
      })
    ) => {
      const minX = Math.min(...bufferedNodes.map((s) => s.position.x));
      const minY = Math.min(...bufferedNodes.map((s) => s.position.y));

      const now = Date.now();

      const newNodes: Node[] = bufferedNodes.map((node) => {
        const id = `${node.id}-${now}`;
        const x = pasteX + (node.position.x - minX);
        const y = pasteY + (node.position.y - minY);

        return { ...node, id, position: { x, y } };
      });

      const newEdges: Edge[] = bufferedEdges.map((edge) => {
        const id = `${edge.id}-${now}`;
        const source = `${edge.source}-${now}`;
        const target = `${edge.target}-${now}`;

        return { ...edge, id, source, target };
      });

      setNodes((nodes) => [
        ...nodes.map((node) => ({ ...node, selected: false })),
        ...newNodes,
      ]);
      setEdges((edges) => [...edges, ...newEdges]);
    },
    [bufferedEdges, bufferedNodes, screenToFlowPosition, setEdges, setNodes]
  );

  const cut = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const selectedEdges = getConnectedEdges(selectedNodes, getEdges()).filter(
      (edge) => {
        const isExternalSource = selectedNodes.every(
          (n) => n.id !== edge.source
        );
        const isExternalTarget = selectedNodes.every(
          (n) => n.id !== edge.target
        );

        return !(isExternalSource || isExternalTarget);
      }
    );

    setBufferedNodes(selectedNodes);
    setBufferedEdges(selectedEdges);

    // cut操作需要将复制的节点和边从图中移除
    setNodes((nodes) => nodes.filter((node) => !node.selected));
    setEdges((edges) => edges.filter((edge) => !selectedEdges.includes(edge)));
  }, [getNodes, setNodes, getEdges, setEdges]);

  // 注册快捷键
  useShortcut(["Meta+x", "Ctrl+x"], cut);
  useShortcut(["Meta+c", "Ctrl+c"], copy);
  useShortcut(["Meta+v", "Ctrl+v"], paste);

  return { cut, copy, paste, bufferedNodes, bufferedEdges };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function useShortcut(keyCode: KeyCode, callback: Function): void {
  const [didRun, setDidRun] = useState(false);
  const shouldRun = useKeyPress(keyCode);

  useEffect(() => {
    if (shouldRun && !didRun) {
      callback();
      setDidRun(true);
    } else {
      setDidRun(shouldRun);
    }
  }, [shouldRun, didRun, callback]);
}

export default useCopyPaste;
