import { stringToColor } from "../utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import * as Y from "yjs";
import useYjs from "../useYjs";

const MAX_IDLE_TIME = 10000;

export type Cursor = {
  id: string;
  color: string;
  x: number;
  y: number;
  timestamp: number;
};

export function useCursorStateSynced(roomName: string) {
  const { ydoc } = useYjs(roomName);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [cursorsMap, setCursorsMap] = useState<Y.Map<Cursor> | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 设置游标ID和颜色
  const cursorId = useMemo(() => {
    return ydoc?.clientID.toString() || "";
  }, [ydoc]);

  const cursorColor = useMemo(() => {
    return stringToColor(cursorId);
  }, [cursorId]);

  // 初始化 cursorsMap
  useEffect(() => {
    if (!ydoc) return;

    const map = ydoc.getMap<Cursor>("cursors");
    setCursorsMap(map);

    return () => {
      setCursorsMap(null);
    };
  }, [ydoc]);

  // Flush any cursors that have gone stale.
  const flush = useCallback(() => {
    if (!cursorsMap) return;

    const now = Date.now();

    cursorsMap.doc?.transact(() => {
      for (const [id, cursor] of cursorsMap) {
        if (now - cursor.timestamp > MAX_IDLE_TIME) {
          cursorsMap.delete(id);
        }
      }
    });
  }, [cursorsMap]);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!cursorsMap || !cursorId) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      cursorsMap.set(cursorId, {
        id: cursorId,
        color: cursorColor,
        x: position.x,
        y: position.y,
        timestamp: Date.now(),
      });
    },
    [screenToFlowPosition, cursorsMap, cursorId, cursorColor]
  );

  useEffect(() => {
    if (!cursorsMap) return;

    const timer = window.setInterval(flush, MAX_IDLE_TIME);
    const observer = () => {
      setCursors(Array.from(cursorsMap.values()));
    };

    flush();
    setCursors(Array.from(cursorsMap.values()));
    cursorsMap.observe(observer);

    return () => {
      if (cursorsMap) {
        cursorsMap.unobserve(observer);
      }
      window.clearInterval(timer);
    };
  }, [flush, cursorsMap]);

  const cursorsWithoutSelf = useMemo(
    () => cursors.filter(({ id }) => id !== cursorId),
    [cursors, cursorId]
  );

  return [cursorsWithoutSelf, onMouseMove] as const;
}

export default useCursorStateSynced;
