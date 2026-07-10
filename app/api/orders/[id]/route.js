import { updateOrder, deleteOrder, getOrders } from "@/lib/data";
import { broadcastOrderUpdate } from "@/lib/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/orders/[id] — return order details (for customer tracking)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const store = await getOrders();
    const order = store.orders.find((o) => o.orderId === id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update order status (pending → done, unlock ticket, etc.)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateOrder(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    broadcastOrderUpdate(updated);
    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// DELETE /api/orders/[id] — remove an order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteOrder(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
