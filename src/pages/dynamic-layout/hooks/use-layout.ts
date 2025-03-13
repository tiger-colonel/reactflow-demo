import { useEffect, useRef } from "react";
import {
  useReactFlow,
  useStore,
  Node,
  Edge,
  ReactFlowState,
} from "@xyflow/react";
import { stratify, tree } from "d3-hierarchy";
import { timer } from "d3-timer";

// 初始化树布局（参考 https://observablehq.com/@d3/tree 获取示例）
const layout = tree<Node>()
  // 节点大小配置节点间的间距 ([宽度, 高度])
  .nodeSize([200, 150])
  // 这是为了在所有节点之间创建相等的空间
  .separation(() => 1);

const options = { duration: 200 };

// 布局函数
// 接受当前节点和边，返回带有更新位置的已布局节点
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  // 如果没有节点，我们就无法计算布局
  if (nodes.length === 0) {
    return [];
  }
  // 将节点和边转换为层次对象，以便与布局函数一起使用
  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // 通过搜索边来获取每个节点的id
    // 这仅在每个节点有一个连接时有效
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes
  );

  // 使用层次数据结构运行布局算法
  const root = layout(hierarchy);

  // 将层次结构转换回react flow节点（原始节点存储为d.data）
  // 我们只从d3函数中提取位置
  return root
    .descendants()
    .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }));
}

// 这是用于触发布局的存储选择器，当节点变化时，它返回节点数量
const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size;

function useLayout() {
  // 这个ref用于在首次运行时适配节点
  // 首次运行后，这将设置为false
  const initial = useRef(true);

  // 我们使用nodeCount作为重新布局的触发器
  // 每当节点长度改变时，我们计算新的布局
  const nodeCount = useStore(nodeCountSelector);

  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } =
    useReactFlow();

  useEffect(() => {
    // 获取当前节点和边
    const nodes = getNodes();
    const edges = getEdges();

    // 运行布局并获取带有更新位置的节点
    const targetNodes = layoutNodes(nodes, edges);

    // 如果你不想为节点添加动画，可以取消下面一行的注释
    // return setNodes(targetNodes);

    // 为了对新位置进行插值和动画处理，我们创建包含每个节点当前和目标位置的对象
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        // 这是节点当前放置的位置
        from: getNode(node.id)?.position || node.position,
        // 这是我们希望节点被放置的位置
        to: node.position,
        node,
      };
    });

    // 创建一个定时器，使节点动画到新位置
    const t = timer((elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          id: node.id,
          position: {
            // 简单的线性插值
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
          data: { ...node.data },
          type: node.type,
        };
      });

      setNodes(currNodes);

      // 这是动画的最后一步
      if (elapsed > options.duration) {
        // 我们将节点移动到它们的目标位置
        // 这是为了避免故障
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            id: node.id,
            position: {
              x: to.x,
              y: to.y,
            },
            data: { ...node.data },
            type: node.type,
          };
        });

        setNodes(finalNodes);

        // 停止动画
        t.stop();

        // 在首次运行时，适配视图
        if (!initial.current) {
          fitView({ duration: 200, padding: 0.2 });
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [nodeCount, getEdges, getNodes, getNode, setNodes, fitView, setEdges]);
}

export default useLayout;
