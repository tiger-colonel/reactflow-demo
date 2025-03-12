/* eslint-disable react-func/max-lines-per-function */
import { useState } from "react";
import { Button, Input, message } from "antd";
import { ReactFlowInstance } from "reactflow";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useMutation } from "@tanstack/react-query";
import flow from "@/service/flow";
import { FlowInfoType, ISideStore } from "../../constant";
import { generateCode } from "./util";

export const Toolbar = ({
  instance,
  getFlowInfo,
  flowInfo,
  sideBarStore,
  setFlowInfo,
  getFlowList,
  setLock,
}: {
  flowInfo: FlowInfoType;
  getFlowInfo: () => void;
  getFlowList: () => void;
  instance: ReactFlowInstance | null;
  setFlowInfo: (flowInfo: FlowInfoType) => void;
  setLock?: (lock: boolean) => void;
  sideBarStore: ISideStore;
}) => {
  const [copy, setCopy] = useState({
    value: "",
    copied: false,
  });

  const handleParams = () => {
    if (!instance) return;
    const flowObj = instance.toObject();
    const { nodes, edges } = flowObj;
    const res = generateCode(nodes, edges);
    const returnObj = {
      ...res,
      param_name_tup: sideBarStore?.argList.map((item) => item),
      ret: sideBarStore?.returnList,
      name: flowInfo.processName,
    };

    const flow = JSON.stringify(returnObj);
    setCopy({ ...copy, value: flow });

    return {
      flow,
      flow_layout: JSON.stringify({
        ...flowInfo,
        ...sideBarStore,
        nodes,
        edges,
      }),
    };
  };

  const { mutate: updateFlow } = useMutation<any, any, any>({
    mutationFn: (data) => flow.updateFlow(flowInfo.id, data),
    onSuccess: (res) => {
      message.success("更新成功");
      getFlowList();
      getFlowInfo();
      setLock?.(false);
    },
  });
  const handleUpdate = async () => {
    await updateFlow(handleParams());
  };

  const { mutate: deleteFlow } = useMutation<any, any, any>({
    mutationFn: (id) => flow.deleteFlow(id),
    onSuccess: (res) => {
      message.success("删除成功");
      getFlowList();
      setFlowInfo({} as FlowInfoType);
    },
  });
  const handleDelete = async () => {
    await deleteFlow(flowInfo.id);
  };

  return (
    <div className="flex justify-between">
      <div className="flex">
        <div>Process Name:</div>
        <div className="ml-8px">
          <Input
            value={flowInfo?.processName}
            onChange={(e: any) =>
              setFlowInfo({ ...flowInfo, processName: e.target.value })
            }
            placeholder="请输入 Process Name"
          />
        </div>
      </div>
      <div>
        <CopyToClipboard
          text={copy.value}
          onCopy={() => {
            setCopy({ ...copy, copied: true });
            message.success("复制成功");
          }}
        >
          <Button
            className="mr-12px"
            type="primary"
            onClick={() => handleParams()}
          >
            生成代码
          </Button>
        </CopyToClipboard>
        <Button
          type="primary"
          danger
          className="mr-12px"
          onClick={() => handleDelete()}
        >
          删 除
        </Button>
        <Button type="primary" className="mr-12px" onClick={handleUpdate}>
          更 新
        </Button>
      </div>
    </div>
  );
};
