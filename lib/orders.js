// lib/orders.js — SSE broadcaster + in-memory order pub/sub
// Uses globalThis so the singleton survives Next.js hot-reloads in dev.

if (!globalThis._orderClients) {
  globalThis._orderClients = new Set();
}
if (!globalThis._orderCounter) {
  globalThis._orderCounter = 0;
}

/** Register a manager SSE client (a WritableStreamDefaultWriter or compatible). */
export function addOrderClient(writer) {
  globalThis._orderClients.add(writer);
}

export function removeOrderClient(writer) {
  globalThis._orderClients.delete(writer);
}

/**
 * Push a new order event to all connected manager tabs.
 * Silently removes dead connections.
 */
export function broadcastOrder(order) {
  const payload = `data: ${JSON.stringify({ type: "new_order", order })}\n\n`;
  for (const writer of globalThis._orderClients) {
    try {
      writer.write(payload);
    } catch {
      globalThis._orderClients.delete(writer);
    }
  }
}

/**
 * Push an order-updated event (status change) to all manager tabs.
 */
export function broadcastOrderUpdate(order) {
  const payload = `data: ${JSON.stringify({ type: "order_updated", order })}\n\n`;
  for (const writer of globalThis._orderClients) {
    try {
      writer.write(payload);
    } catch {
      globalThis._orderClients.delete(writer);
    }
  }
}

/** Generate the next friendly order number, e.g. #001 */
export function nextOrderNumber() {
  globalThis._orderCounter += 1;
  return `#${String(globalThis._orderCounter).padStart(3, "0")}`;
}
