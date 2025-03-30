import {
  defineEventHandler,
  defineWebSocket,
} from "@tanstack/react-start/server";

export default defineEventHandler({
  handler() {},
  websocket: defineWebSocket({
    open(peer) {
      peer.subscribe("chat");
    },
    async message(peer, msg) {
      const message = msg.text();
      // Broadcast message to all other clients
      peer.publish("chat", message);
    },
    async error(peer, error) {
      console.log("error", peer.id, error);
    },
  }),
});
