import { addOrderClient, removeOrderClient } from "@/lib/orders";

export const dynamic = "force-dynamic";

// GET /api/orders/stream — Server-Sent Events endpoint.
// Each connected manager browser tab keeps this connection open and receives
// "new_order" and "order_updated" events in real time.
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial "connected" ping so the client knows the stream is live
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

      // Keep-alive: send a comment every 20 seconds to prevent proxy timeouts
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 20_000);

      // Build a writer-like object that lib/orders.js can call .write() on
      const writer = {
        write(text) {
          controller.enqueue(encoder.encode(text));
        },
      };

      addOrderClient(writer);

      // Cleanup when browser disconnects
      return () => {
        clearInterval(keepAlive);
        removeOrderClient(writer);
      };
    },
    cancel() {
      // Called when client closes the connection — cleanup handled above
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  });
}
