/* eslint-disable react-func/max-lines-per-function */
import { omit, pick } from "lodash-es";
import { Node, Edge } from "reactflow";
import { nanoid } from "nanoid";
import { INodeData, NodeTypeEnum } from "../../constant";
import { getJsonValue } from "../../util";

const nodeKeysMap: { [key: string]: string[] } = {
  [NodeTypeEnum.Decision]: ["id", "name", "label", "eval_str"],
  [NodeTypeEnum.Switch]: ["id", "name", "label", "eval_str"],
  [NodeTypeEnum.Process]: ["id", "label", "name", "func", "args"],
  [NodeTypeEnum.Assignment]: [
    "id",
    "label",
    "name",
    "outputType",
    "outputValue",
    "args",
    "varStr",
  ],
};

export const generateCode = (nodes: Node[], edges: Edge[]) => {
  // 1. 生成新节点，保留主要信息
  const newNodes = nodes.map((node: Node<INodeData>) =>
    pick(
      {
        id: node.id,
        ...node.data,
      },
      nodeKeysMap[node.type!]
    )
  );
  // console.log("------newNodes------", newNodes);

  // 2. 新节点处理为对象形式
  // demo：
  // {
  //   gNfww_9y_SjnFmdkos8W1: {
  //     id: "gNfww_9",
  //     label: "if_task_status_unknow",
  //     eval_str: "task_state[object_state] == unknow",
  //     name: "If",
  //   },
  // }
  const nodesMap = newNodes.reduce((acc, node) => {
    acc[node.id!] = node;
    return acc;
  }, {} as { [key in string]: any });
  // console.log("------nodesMap------", JSON.stringify(nodesMap));

  // 3. 生成新边，保留主要信息
  const newEdges = edges.map((edge) => {
    return {
      source: edge.source,
      target: edge.target,
      label: edge.label,
    };
  });

  // 4. 新边处理为对象形式
  // demo:
  // {
  //   gNfww_9y_SjnFmdkos8W1: ["NmYzykk9CLpJCbSOAFjN4", "lkyufxVj45zaWgj-QEX9l"],
  //   NmYzykk9CLpJCbSOAFjN4: ["lkyufxVj45zaWgj-QEX9l"],
  // };
  const edgesObj = newEdges.reduce((acc, edge) => {
    const { source, target } = edge;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(target);
    return acc;
  }, {} as { [key in string]: Array<string> });

  // 处理edges，生成符合条件的edge数据
  const connectedNodes: { [key in string]: any } = {};
  Object.entries(edgesObj).forEach((kv: [string, Array<string>]) => {
    const [key, nodeIds] = kv;
    const sourceLabel = nodesMap[key].label;
    const nodeType = nodesMap[key].name;

    connectedNodes[sourceLabel] = nodeIds
      .map((id: string) => nodesMap[id])
      .reduce((acc, node) => {
        const isExist = edges.find((edge) => {
          return edge.target === node.id && edge.source === key;
        });

        if (isExist?.label) {
          acc[node.label] = {
            condition: getCondition(nodeType, isExist),
          };
        } else {
          acc[node.label] = {};
        }
        return acc;
      }, {} as any);
  });

  // 处理nodes，生成符合条件的node数据
  const resultNodesObj = newNodes.reduce((acc, node) => {
    const { args, name, label } = node;
    let newNode: any = {
      name: label,
    };

    switch (name) {
      case NodeTypeEnum.Assignment:
        const { outputType, outputValue, varStr } = node;
        const rightObj =
          outputType !== "process"
            ? outputValue
            : {
                name: `proecss_${nanoid(6)}`,
                type: "process",
                func: outputValue,
                args: args?.map((arg) =>
                  Array.isArray(arg) ? arg.join("") : arg
                ),
              };
        newNode = {
          type: "assignment",
          name: label,
          left: varStr,
          right: rightObj,
        };
        break;
      case NodeTypeEnum.Decision:
        newNode = {
          ...node,
          ...newNode,
          type: "decision",
        };
        break;
      case NodeTypeEnum.Process:
        newNode = {
          ...node,
          ...newNode,
          type: "process",
          args: args?.length
            ? args?.map((arg) => (Array.isArray(arg) ? arg.join("") : arg))
            : null,
        };
        break;
      case NodeTypeEnum.Switch:
        newNode = {
          type: "switch",
          ...node,
          ...newNode,
          eval_str: (node.eval_str as string[])?.join(""),
        };
        break;
    }

    acc[node.label!] = omit(newNode, ["label", "id"]);
    return acc;
  }, {} as any);

  return {
    nodes: resultNodesObj,
    adj: connectedNodes,
  };
};

// edge的label特殊处理
const booleanMap: { [key: string]: boolean } = {
  True: true,
  False: false,
};
const getCondition = (nodeType: NodeTypeEnum, edge: Edge) => {
  const { label, edgeLabelType } = edge as Edge & { edgeLabelType: string };
  if (nodeType === NodeTypeEnum.Decision) {
    return {
      type: "decision",
      value: booleanMap[label as string],
    };
  } else if (nodeType === NodeTypeEnum.Switch) {
    return {
      type: "switch",
      value: getJsonValue(label, edgeLabelType),
    };
  }
};
