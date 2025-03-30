import { Message } from "~/types";
import Dexie, { EntityTable } from "dexie";

import { User } from "~/types";

export const db = new Dexie("chat-app-db") as Dexie & {
  messages: EntityTable<Message, "id">;
  users: EntityTable<
    User & { createdAt: string; updatedAt: string; deletedAt?: string },
    "id"
  >;
};

db.version(2).stores({
  messages:
    "++id, text, senderId, channelId, timestamp, status, isLocal, attachments",
  users: "id, username, status, lastSeen, createdAt, updatedAt",
});

db.version(4)
  .stores({
    messages:
      "++id, text, senderId, channelId, createdAt, status, isLocal, attachments, deletedAt",
    users: "id, username, status, lastSeen, createdAt, updatedAt, deletedAt",
  })
  .upgrade((tx) => {
    return tx
      .table("messages")
      .toCollection()
      .modify((message) => {
        if ("timestamp" in message) {
          message.createdAt = message.timestamp;
          delete message.timestamp;
        }
      });
  });
