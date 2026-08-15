export type Note = {
  id: string;
  title: string;
  topic: string;
  body: string;
  source: { label: string; href: string };
};

export const notes: Note[] = [
  {
    id: "outbox",
    title: "Publish after commit is the bug",
    topic: "Distributed systems",
    body: "Writing to the database and then publishing to the broker looks fine until the process dies in between. The outbox table turns two operations into one transaction; a relay does the publishing later, and idempotent consumers make the inevitable duplicates harmless.",
    source: { label: "Event-Driven Analytics", href: "https://github.com/vinodkumarpeddi/Event-Driven-Analytics-System-with-a-Message-Broker" },
  },
  {
    id: "idempotency",
    title: "Idempotency is the cheapest insurance",
    topic: "Backend",
    body: "A unique constraint on an idempotency key is a few characters of SQL. Without it, every retry — from a client, a broker, a load balancer — is a potential double charge or double order. Design the key into the contract, not into a hotfix.",
    source: { label: "Order Processor Service", href: "https://github.com/vinodkumarpeddi/order-processor-service" },
  },
  {
    id: "202",
    title: "202 Accepted and a durable queue",
    topic: "APIs",
    body: "Ingestion endpoints don't need to finish the work; they need to promise it. Validate, publish to a durable queue with persistent messages, return 202. Reject malformed messages without requeue; nack transient failures so they come back.",
    source: { label: "User Activity Service", href: "https://github.com/vinodkumarpeddi/Build-an-Event-Driven-User-Activity-Service-with-RabbitMQ-and-Rate-Limiting" },
  },
  {
    id: "webhooks",
    title: "Webhooks are a retry problem",
    topic: "Payments",
    body: "The merchant's endpoint will be down at the worst moment. Delivery has to be its own job with exponential backoff and an attempt cap, and it must never sit in the request path of the payment itself.",
    source: { label: "Payment Orchestrator", href: "https://github.com/vinodkumarpeddi/Payment" },
  },
  {
    id: "diff",
    title: "Snapshot, diff, broadcast",
    topic: "Real-time",
    body: "When the upstream can't push, poll it into a snapshot and diff against the last one with a pure function. Pure means testable: added, modified, deleted, and mixed cases become table-driven tests instead of manual checks.",
    source: { label: "Real-Time FTP Monitor", href: "https://github.com/vinodkumarpeddi/Build-a-Real-Time-FTP-File-System-Monitoring-Dashboard-with-WebSockets" },
  },
  {
    id: "classify",
    title: "Classify, then respond",
    topic: "AI systems",
    body: "A small fast model labels intent with a confidence score; a larger model answers as the matching expert. Below a 0.7 threshold the system asks instead of guessing — cheaper, faster and more honest than one giant prompt.",
    source: { label: "LLM Prompt Router", href: "https://github.com/vinodkumarpeddi/LLM-Powered-Prompt-Router" },
  },
];
