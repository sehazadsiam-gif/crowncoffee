import { addOrderClient, removeOrderClient } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]/stream
 * Customer SSE endpoint — subscribes to the global order event bus but
 * only forwards events that match this specific orderId.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", orderId: id })}\n\n`));

      // Keep-alive every 20 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 20_000);

      // Writer adapter — filters events to only this orderId
      const writer = {
        write(text) {
          try {
            // Parse the SSE payload and filter by orderId
            const match = text.match(/^data: (.+)\n\n$/s);
            if (match) {
              const msg = JSON.parse(match[1]);
              // Forward: order_updated for this order, or order_deleted for this order
              if (
                (msg.type === "order_updated" && msg.order?.orderId === id) ||
                (msg.type === "order_deleted" && msg.orderId === id)
              ) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch {
            // ignore malformed events
          }
        },
      };

      addOrderClient(writer);

      return () => {
        clearInterval(keepAlive);
        removeOrderClient(writer);
      };
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
