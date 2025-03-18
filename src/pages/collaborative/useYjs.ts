import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as awarenessProtocol from "y-protocols/awareness";

interface UseYjsResult {
  ydoc: Y.Doc | null;
  awareness: awarenessProtocol.Awareness | null;
}

const useYjs = (roomName: string): UseYjsResult => {
  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<awarenessProtocol.Awareness | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const awareness = new awarenessProtocol.Awareness(ydoc);
    awarenessRef.current = awareness;

    const socket = io("http://localhost:3000", {
      query: { room: roomName },
    });

    socketRef.current = socket;

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

    return () => {
      console.log("Websocket 已断开");
      socket.off("connect");
      socket.off("sync");
      socket.off("update");
      ydoc.off("update", updateHandler);
      // awareness.off("update", awarenessUpdateHandler);
      socket.disconnect();
      ydoc.destroy();
    };
  }, [roomName]);

  return {
    ydoc: ydocRef.current,
    awareness: awarenessRef.current,
  };
};

export default useYjs;
