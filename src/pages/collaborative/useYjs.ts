import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as awarenessProtocol from "y-protocols/awareness";

// 创建一个单例存储对象
const connections = new Map<
  string,
  {
    socket: Socket;
    ydoc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    refCount: number;
  }
>();

interface UseYjsResult {
  ydoc: Y.Doc | null;
  awareness: awarenessProtocol.Awareness | null;
}

const useYjs = (roomName: string): UseYjsResult => {
  const connectionRef =
    useRef<typeof connections extends Map<string, infer T> ? T : never>(null);
  const awarenessRef = useRef<awarenessProtocol.Awareness | null>(null);

  useEffect(() => {
    let connection = connections.get(roomName);
    if (!connection) {
      const ydoc = new Y.Doc();

      const awareness = new awarenessProtocol.Awareness(ydoc);
      awarenessRef.current = awareness;
      const socket = io("http://localhost:3000", {
        query: { room: roomName },
      });

      connection = {
        socket,
        ydoc,
        awareness,
        refCount: 0,
      };
      connections.set(roomName, connection);

      socket.on("connect", () => {
        console.log("Websocket 已连接");
        // 连接后立即发送同步请求
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0); // MessageType.SYNC
        syncProtocol.writeSyncStep1(encoder, ydoc);
        socket.emit("sync", encoding.toUint8Array(encoder));

        // 查询其他客户端的状态
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, 3); //MessageType.QUERY_AWARENESS
        socket.emit("sync", encoding.toUint8Array(awarenessEncoder));
      });

      socket.on("sync", (message: ArrayBuffer) => {
        const uint8Array = new Uint8Array(message);
        const decoder = decoding.createDecoder(uint8Array);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case 0: {
            // MessageType.SYNC
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 0);
            const syncMessageType = syncProtocol.readSyncMessage(
              decoder,
              encoder,
              ydoc,
              socket
            );

            if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
              syncProtocol.writeSyncStep2(encoder, ydoc);
              socket.emit("sync", encoding.toUint8Array(encoder));
            } else if (syncMessageType === syncProtocol.messageYjsSyncStep2) {
              socket.emit("sync", encoding.toUint8Array(encoder));
            }
            break;
          }
          case 1: {
            // MessageType.AWARENESS
            const awarenessUpdate = decoding.readVarUint8Array(decoder);
            awarenessProtocol.applyAwarenessUpdate(
              awareness,
              awarenessUpdate,
              socket
            );
            break;
          }
        }
      });

      socket.on("update", (update: unknown) => {
        const uint8Array = new Uint8Array(update as number[]); // Cast update to number[] to make TypeScript happy
        Y.applyUpdate(ydoc, uint8Array);
      });

      // 发送更新到服务器
      const updateHandler = (update: Uint8Array, origin: unknown) => {
        if (origin !== socket) {
          socket.emit("update", Array.from(update));
        }
      };
      ydoc.on("update", updateHandler);

      // 处理 awareness 更新
      const awarenessUpdateHandler = (
        {
          added,
          updated,
          removed,
        }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown
      ) => {
        if (origin !== socket) {
          const changedClients = added.concat(updated).concat(removed);
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 1); // MessageType.AWARENESS
          encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
          );
          socket.emit("sync", encoding.toUint8Array(encoder));
        }
      };

      awareness.on("update", awarenessUpdateHandler);
    }

    // 增加引用计数
    connection.refCount++;
    connectionRef.current = connection;
    return () => {
      const conn = connections.get(roomName);
      if (conn) {
        conn.refCount--;

        // 当没有组件使用这个连接时，清理资源
        if (conn.refCount === 0) {
          conn.socket.disconnect();
          conn.ydoc.destroy();
          connections.delete(roomName);
        }
      }
    };
  }, [roomName]);

  return {
    ydoc: connectionRef.current?.ydoc || null,
    awareness: connectionRef.current?.awareness || null,
  };
};

export default useYjs;
