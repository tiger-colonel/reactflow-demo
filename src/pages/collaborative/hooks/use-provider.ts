import { useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";

// 全局单例 provider
let globalProvider: HocuspocusProvider | null = null;

/**
 * 获取或创建全局 provider 实例
 * @param roomName 协作房间名称
 * @returns provider 实例和相关状态
 */
export function useProvider(roomName: string = "example-document") {
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // const [refCount, setRefCount] = useState(0);

  useEffect(() => {
    // 如果全局 provider 不存在，则创建一个
    if (!globalProvider) {
      globalProvider = new HocuspocusProvider({
        url: "ws://127.0.0.1:3001",
        name: roomName,
      });
    }

    setProvider(globalProvider);

    // 监听连接状态和用户数量
    const onStatusChange = () => {
      setIsConnected(globalProvider?.isConnected || false);
    };

    // const onAwarenessUpdate = () => {
    //   if (globalProvider) {
    //     const users = globalProvider.awareness.getStates();
    //     setRefCount(users.size);
    //   }
    // };

    globalProvider.on("status", onStatusChange);
    // globalProvider.awareness.on("update", onAwarenessUpdate);

    onStatusChange();
    // onAwarenessUpdate();

    return () => {
      if (globalProvider) {
        globalProvider.off("status", onStatusChange);
        // globalProvider.awareness.off("update", onAwarenessUpdate);
      }
    };
  }, [roomName]);

  return {
    provider,
    document: provider?.document,
    isConnected,
    // refCount,
  };
}

export default useProvider;
