import { Doc } from "yjs";

import { WebsocketProvider } from "y-websocket";

const ydoc = new Doc();

export const wsProvider = new WebsocketProvider(
  "ws://localhost:3000",
  "REACTFLOW-COLLAB-EXAMPLE",
  ydoc,
  { connect: false }
);

wsProvider.on("status", (event) => {
  console.log("event.status=========>", event.status);
});

export default ydoc;
