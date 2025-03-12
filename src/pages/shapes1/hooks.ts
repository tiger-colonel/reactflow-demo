import { useQuery } from "@tanstack/react-query";
import flow from "@/service/flow";
import { FlowInfoType, FlowItem } from "./constant";

export const useGetFlowList = () => {
  return useQuery({
    queryKey: ["flowList"],
    queryFn: () => flow.flowsList(),
    select: (data) => {
      return (data as FlowItem[])
        .map(
          (item) =>
            ({
              id: item.id,
              ...JSON.parse(item.flow_layout ? item.flow_layout : "{}"),
            } as FlowInfoType)
        )
        .sort((a: FlowInfoType, b: FlowInfoType) => +a.id - +b.id);
    },
  });
};

export const useGetFlowInfo = (id: string) => {
  return useQuery({
    queryKey: ["flowInfo", id],
    queryFn: () => flow.getFlow(id),
    enabled: !!id,
    select: (data) => {
      const res = JSON.parse(data.flow_layout ?? "{}");
      return {
        id,
        ...res,
      };
    },
  });
};

export const useGetGlobalInfo = () => {
  return useQuery({
    queryKey: ["global"],
    queryFn: () => flow.globalInfo(),
  });
};
