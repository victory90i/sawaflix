import { Client } from "@upstash/qstash";

if (typeof window !== 'undefined') {
  console.warn("qstash.ts is being loaded in the browser. This should only happen on the server.");
}

if (!process.env.QSTASH_TOKEN) {
  console.warn("QSTASH_TOKEN is not defined. Notifications will not be sent to the queue.");
}

export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "placeholder",
});
