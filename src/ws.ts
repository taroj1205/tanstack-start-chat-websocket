import {
  defineEventHandler,
  defineWebSocket,
} from "@tanstack/react-start/server";

export default defineEventHandler({
  handler() {},
  websocket: defineWebSocket({
    open(peer) {
      // Broadcast user count to all clients
      peer.publish("user", {
        type: "join",
        userId: peer.id,
      });
      peer.subscribe("user");
      peer.subscribe("chat");
    },
    async message(peer, msg) {
      const message = msg.text();
      // Broadcast message to all other clients
      peer.publish("chat", message);
    },
    async close(peer) {
      // Broadcast updated user count when someone disconnects
      peer.publish("user", {
        type: "leave",
        userId: peer.id,
      });
    },
    async error(peer, error) {
      console.log("error", peer.id, error);
    },
  }),
});
