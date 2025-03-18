import { Doc } from "yjs";

import { WebsocketProvider } from "y-websocket";

const ydoc = new Doc();

// const socket = new WebSocket("ws://localhost:3000");

// const provider = {
//   ws: socket,
//   onUpdate: (update) => {
//     socket.send();
//   },
// };

export const wsProvider = new WebsocketProvider(
  "ws://localhost:3000",
  "REACTFLOW-COLLAB-EXAMPLE",
  ydoc,
  { connect: false }
);

wsProvider.on("status", (event) => {
  console.log("event.status=========>", event.status);
});

// wsProvider.on("message", (event) => {
//   console.log("Received message:", event.data);
// });

export default ydoc;
