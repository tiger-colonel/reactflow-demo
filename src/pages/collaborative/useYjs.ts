import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

// 创建一个单例存储对象
const connections = new Map<
  string,
  {
    socket: Socket;
    ydoc: Y.Doc;
    refCount: number;
  }
>();

interface UseYjsResult {
  ydoc: Y.Doc | null;
  refCount: number;
}

const useYjs = (roomName: string): UseYjsResult => {
  const connectionRef =
    useRef<typeof connections extends Map<string, infer T> ? T : never>(null);

  useEffect(() => {
    let connection = connections.get(roomName);
    if (!connection) {
      const ydoc = new Y.Doc();

      const socket = io("http://localhost:3000", {
        query: { room: roomName },
      });

      connection = {
        socket,
        ydoc,
        refCount: 0,
      };
      connections.set(roomName, connection);

      socket.on("connect", () => {
        console.log("Websocket 已连接");
        // 连接后立即发送同步请求
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0); // MessageType.SYNC 写入消息类型（0 表示同步消息）

        syncProtocol.writeSyncStep1(encoder, ydoc); // 使用 y-protocol/sync 写入同步的第一步（同步客户端的 state vector）
        socket.emit("sync", encoding.toUint8Array(encoder)); // 发送同步消息到服务器
      });

      socket.on("sync", (message: ArrayBuffer) => {
        const uint8Array = new Uint8Array(message);
        const decoder = decoding.createDecoder(uint8Array); // 创建一个解码器，用于反序列化数据
        const messageType = decoding.readVarUint(decoder); // 读取消息类型

        switch (messageType) {
          case 0: {
            // MessageType.SYNC
            const encoder = encoding.createEncoder();

            const syncMessageType = syncProtocol.readSyncMessage(
              decoder,
              encoder,
              ydoc,
              socket
            );

            if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
              syncProtocol.writeSyncStep2(encoder, ydoc); // 使用 y-protocol/sync 写入同步的第二步（同步客户端的缺失更新）
              socket.emit("sync", encoding.toUint8Array(encoder));
            } else if (syncMessageType === syncProtocol.messageYjsSyncStep2) {
              socket.emit("sync", encoding.toUint8Array(encoder));
            }
            break;
          }
        }
      });

      socket.on("update", (update: unknown) => {
        const uint8Array = new Uint8Array(update as number[]);

        // 将接收到的更新应用到本地 Yjs 文档
        Y.applyUpdate(ydoc, uint8Array);
      });

      // 发送更新到服务器
      const updateHandler = (update: Uint8Array, origin: unknown) => {
        if (origin !== socket) {
          socket.emit("update", Array.from(update));
        }
      };
      // 监听本地 Yjs 文档的更新，并在更新发生时执行 updateHandler
      ydoc.on("update", updateHandler);
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
    refCount: connectionRef.current?.refCount || 0,
  };
};

export default useYjs;
