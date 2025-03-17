import { Doc } from "yjs";

import { WebsocketProvider } from "y-websocket";

const ydoc = new Doc();

export const wsProvider = new WebsocketProvider(
  "ws://localhost:3033",
  "REACTFLOW-COLLAB-EXAMPLE",
  ydoc,
  { connect: true }
);

wsProvider.on("status", (event) => {
  console.log("event.status=========>", event.status);
});

// wsProvider.on("message", (event) => {
//   console.log("Received message:", event.data);
// });

export default ydoc;
