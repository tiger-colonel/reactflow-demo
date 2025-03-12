import React, { useEffect, useState } from "react";
import { ReactFlowProvider, ReactFlowInstance } from "reactflow";
import { Layout, Spin } from "antd";
import "reactflow/dist/style.css";

import { isEmpty } from "lodash";
import { Toolbar, Setting, PageList, Graph, PageSider } from "./components";
import { useGetFlowInfo, useGetFlowList, useGetGlobalInfo } from "./hooks";
import { FlowInfoType, ISelectedNode, ISideStore } from "./constant";
import "./index.css";

const { Sider, Content, Header } = Layout;

const ReactFlow = () => {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { data: globalInfo } = useGetGlobalInfo();

  const { data: flowList, refetch: getFlowList } = useGetFlowList();
  const [flowInfo, setFlowInfo] = useState<FlowInfoType>({} as FlowInfoType);
  useEffect(() => {
    if (flowList?.length && isEmpty(flowInfo)) {
      setFlowInfo(flowList[0]);
    }
  }, [flowList, flowInfo]);

  const {
    data: flowInfoRes,
    isLoading: getFlowInfoLoading,
    refetch: refetchFlowInfo,
  } = useGetFlowInfo(flowInfo?.id);

  const [sideBarStore, setSideBarStore] = useState<ISideStore>({
    argList: [],
    contextList: [],
    returnList: [],
  });

  useEffect(() => {
    if (!flowInfoRes) return;
    console.log("------flowInfoRes------", flowInfoRes);
    setFlowInfo(flowInfoRes);
    const { argList, contextList, returnList } = flowInfoRes;
    setSideBarStore({
      argList,
      contextList,
      returnList,
    });
  }, [flowInfoRes]);

  const [selectedNode, setSelectedNode] = useState<ISelectedNode>();

  const [lock, setLock] = useState<boolean>(false);

  return (
    <Layout
      className="p-24px h-[calc(100vh-96px)]"
      style={{ minHeight: 800, overflow: "auto" }}
    >
      <Sider theme="light" className="mr-12px">
        <PageList
          globalInfo={globalInfo}
          flowInfo={flowInfo}
          setFlowInfo={setFlowInfo}
          flowList={flowList}
          getFlowList={getFlowList}
          setSelected={setSelectedNode}
          lock={lock}
          setLock={setLock}
        />
      </Sider>
      <Layout>
        <ReactFlowProvider>
          <Header style={{ background: "var(--white)", padding: "0 24px" }}>
            <Toolbar
              instance={reactFlowInstance}
              getFlowInfo={refetchFlowInfo}
              sideBarStore={sideBarStore}
              flowInfo={flowInfo}
              setFlowInfo={setFlowInfo}
              getFlowList={getFlowList}
              setLock={setLock}
            />
          </Header>
          <Content
            style={{ position: "relative", display: "flex", marginTop: 12 }}
          >
            {getFlowInfoLoading ? (
              <Spin
                size="large"
                style={{
                  paddingTop: 120,
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <React.Fragment>
                <PageSider
                  sideBarStore={sideBarStore}
                  setSideBarStore={setSideBarStore}
                />
                <Graph
                  flowInfo={flowInfo}
                  instance={reactFlowInstance}
                  setInstance={setReactFlowInstance}
                  setSelected={setSelectedNode}
                  setLock={setLock}
                />
                <Setting
                  sideBarStore={sideBarStore}
                  setSideBarStore={setSideBarStore}
                  globalInfo={globalInfo}
                  selected={selectedNode}
                  setSelected={setSelectedNode}
                  setLock={setLock}
                />
              </React.Fragment>
            )}
          </Content>
        </ReactFlowProvider>
      </Layout>
    </Layout>
  );
};

export default ReactFlow;
