import { db } from "./dexie"

export const getMessages = () => {
  return db.messages
    .filter((message) => !message.deletedAt)
    .distinct()
    .toArray()
}
