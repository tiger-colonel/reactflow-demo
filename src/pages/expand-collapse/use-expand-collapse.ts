import { Edge, Node } from "@xyflow/react";
import { useMemo } from "react";
import Dagre from "@dagrejs/dagre";

const useExpandCollapse = (
  nodes: Node[],
  edges: Edge[]
): {
  nodes: Node[];
  edges: Edge[];
} => {
  return useMemo(() => {
    // 1. 创建一个新的图
    const dagre = new Dagre.graphlib.Graph()
      .setDefaultEdgeLabel(() => ({}))
      .setGraph({ rankdir: "TB" });

    // 2.将每个节点和边添加到 dagre 图中。我们不使用每个节点自身的宽度和高度，
    // 而是告诉 dagre 使用固定值，可以控制节点之间的间距。
    for (const node of nodes) {
      dagre.setNode(node.id, {
        width: 220,
        height: 120,
        data: node.data,
      });
    }

    for (const edge of edges) {
      dagre.setEdge(edge.source, edge.target);
    }

    // 3. 再次遍历节点，以根据展开/折叠状态确定哪些节点应该被隐藏。
    // 被隐藏的节点会从 dagre 图中完全移除。
    for (const node of nodes) {
      // dagree 类型有问题
      const children = dagre.successors(node.id) as unknown as
        | string[]
        | undefined;

      // 根据是否存在子节点，设置节点是否可展开
      node.data.expandable = !!children?.length;
      // 如果节点没有展开，我们将其所有子节点从图中移除
      if (!node.data.expanded) {
        while (children?.length) {
          const child = children.pop()!;

          children.push(...(dagre.successors(child) as unknown as string[]));
          dagre.removeNode(child);
        }
      }
    }

    // 4. 运行 dagre 布局
    Dagre.layout(dagre);

    return {
      // 5. 返回一个新的布局节点数组。此数组将不包括在第 3 步中从 dagre 图中移除的任何节点。
      nodes: nodes.flatMap((node) => {
        // 如果该节点的任何祖先节点被折叠，它可能已被 第 3 步 过滤掉。
        if (!dagre.hasNode(node.id)) return [];

        const { x, y } = dagre.node(node.id);

        const type = "custom";
        const position = { x, y };
        // 🚨 第 3 步会直接修改节点的数据对象。
        // 除非我们在这里创建一个新对象，否则 React 将无法知道数据已更改。
        const data = { ...node.data };

        return [{ ...node, position, type, data }];
      }),
      edges,
    };
  }, [nodes, edges]);
};

export default useExpandCollapse;
