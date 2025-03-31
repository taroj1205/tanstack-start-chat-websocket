import Dexie, { type EntityTable } from "dexie"
import type { Message } from "~/types"

import type { User } from "~/types"

export const db = new Dexie("chat-app-db") as Dexie & {
  messages: EntityTable<Message, "id">
  users: EntityTable<
    User & { createdAt: string; updatedAt: string; deletedAt?: string },
    "id"
  >
}

db.version(2).stores({
  messages:
    "++id, text, senderId, channelId, timestamp, status, isLocal, attachments",
  users: "id, username, status, lastSeen, createdAt, updatedAt",
})

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
          message.createdAt = message.timestamp
          message.timestamp = undefined
        }
      })
  })
