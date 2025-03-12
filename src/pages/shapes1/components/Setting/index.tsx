/* eslint-disable max-depth */
/* eslint-disable react-func/max-lines-per-function */
import { useCallback, useEffect } from "react";
import { useReactFlow, Edge, Node } from "reactflow";
import { cloneDeep } from "lodash-es";
import { Form } from "antd";
import {
  GlobalInfoType,
  ISelectedNode,
  ISideStore,
  INodeData,
  NodeTypeEnum,
  IEdgeData,
} from "../../constant";
import {
  flattenObject,
  getContextList,
  getJsonValue,
  isNode,
} from "../../util";
import {
  EdgeItems,
  ProcessItems,
  DecisionItems,
  SwitchItems,
  AssignmentItems,
} from "./Forms";

interface ISettingProps {
  globalInfo?: GlobalInfoType;
  selected?: ISelectedNode;
  setLock?: (lock: boolean) => void;
  setSelected: (data: ISelectedNode) => void;
  setSideBarStore: (data: ISideStore) => void;
  sideBarStore: ISideStore;
}
export function Setting(props: ISettingProps) {
  const { setNodes, setEdges } = useReactFlow();
  const { sideBarStore, setSideBarStore, globalInfo, selected, setLock } =
    props;
  const { modules: moduleList } = globalInfo || {};

  const { contextList = [] } = cloneDeep(sideBarStore);
  const [form] = Form.useForm();

  /**
   * 右侧表单的值改变
   */
  const onValuesChanged = useCallback(
    (changedValues: any, allValues: any) => {
      const { type, value } = selected || {};
      if (isNode(type)) {
        const node = cloneDeep(value) as Node<INodeData>;
        const currNodeData = {
          ...flattenObject(allValues),
          name: node?.data?.name,
          width: node?.width,
          height: node?.height,
        };

        if (value?.type === NodeTypeEnum.Assignment) {
          const contextKey = ["label", "varStr", "outputType", "outputValue"];
          // 减少更新次数
          const canCreate = contextKey.every((key) => !!allValues[key]);
          if (!canCreate) return;

          const { outputType, outputValue } = allValues;
          if (outputType === "process") {
            const sourceObj = flattenObject(allValues);
            const module = moduleList?.find(
              (item) => item.name === outputValue
            );
            const { args } = module || {};
            const argsArr = args?.map((arg: string) => {
              const value = sourceObj[`${arg}Value`];
              return getJsonValue(value, `${arg}Type`);
            });
            (currNodeData as any).args = argsArr?.filter((i) => i);
          }

          setSideBarStore({
            ...sideBarStore,
            contextList: getContextList(contextList, {
              ...currNodeData,
              id: value?.id,
            }),
          });
        }

        if (value?.type === NodeTypeEnum.Process) {
          const sourceObj = flattenObject(allValues);
          const { func } = allValues;
          const module = moduleList?.find((item) => item.name === func);
          const { args } = module || {};

          const showArgs: string[] = [];
          const argsArr = args?.map((arg: string) => {
            const value = sourceObj[`${arg}Value`];
            showArgs.push(`${arg}=${value ?? ""}`);
            return getJsonValue(value, `${arg}Type`);
          });
          (currNodeData as any).args = argsArr?.filter((i) => i);
          (currNodeData as any).showArgs = showArgs;
        }

        setNodes((nds: Node[]) => {
          return nds.map((it) =>
            it.id === node?.id
              ? {
                  ...it,
                  data: currNodeData,
                }
              : it
          );
        });
        return;
      }

      const edge = cloneDeep(value) as Edge;
      setEdges((eds: Edge[]) => {
        return eds.map((it) =>
          it.id === edge.id
            ? {
                ...edge,
                label: allValues.label,
                data: { edgeLabelType: allValues.edgeLabelType },
              }
            : it
        );
      });
      setLock?.(true);
    },
    [setNodes, setEdges, selected]
  );

  const resetArgsObj = useCallback(
    (data: INodeData, func: string) => {
      const process = moduleList?.find((item) => item.name === func);
      const argsObj = form.getFieldsValue(["args"])?.args || {};
      const args = process?.args || [];
      args?.forEach((arg: string) => {
        argsObj[`${arg}Type`] = data[`${arg}Type`];
        argsObj[`${arg}Value`] = data[`${arg}Value`];
      });
      return argsObj;
    },
    [form, moduleList]
  );

  useEffect(() => {
    const { value } = selected || {};
    form.resetFields();
    if (isNode(selected?.type)) {
      const data = cloneDeep(value?.data);

      // ProcessNode Props reset
      if (value?.type === NodeTypeEnum.Process) {
        data.args = resetArgsObj(data, data.func);
      } else if (value?.type === NodeTypeEnum.Assignment) {
        // AssignmentNode Props reset
        const { outputType, outputValue } = data;
        if (outputType === "process") {
          data.args = resetArgsObj(data, outputValue);
        }
      }

      form.setFieldsValue({
        ...data,
      });
    } else {
      const { label, data } = (value as Edge<IEdgeData>) || {};
      form.setFieldsValue({
        label,
        edgeLabelType: data?.edgeLabelType || "string",
      });
    }
  }, [selected, form, resetArgsObj]);

  const getFormItems = (data: any) => {
    switch (data?.name) {
      case NodeTypeEnum.Process:
        return (
          <ProcessItems
            form={form}
            sideBarStore={sideBarStore}
            moduleList={moduleList}
          />
        );
      case NodeTypeEnum.Decision:
        return <DecisionItems />;
      case NodeTypeEnum.Switch:
        return <SwitchItems sideBarStore={sideBarStore} />;
      case NodeTypeEnum.Assignment:
        return (
          <AssignmentItems
            form={form}
            sideBarStore={sideBarStore}
            moduleList={moduleList}
          />
        );

      default:
        return <EdgeItems currEdge={selected?.value as Edge} form={form} />;
    }
  };

  return selected?.type ? (
    <div
      className="absolute top-0 right-0 bottom-0 p-24px bg-white"
      style={{ width: 300, overflow: "auto" }}
    >
      <h2 className="mb-24px">{selected.value?.data?.name} Props</h2>
      <Form form={form} layout="vertical" onValuesChange={onValuesChanged}>
        {getFormItems(
          isNode(selected.type) ? selected.value.data : { name: selected.type }
        )}
      </Form>
    </div>
  ) : null;
}

export default Setting;
