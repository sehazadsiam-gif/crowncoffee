import { updateOrder, deleteOrder } from "@/lib/data";
import { broadcastOrderUpdate } from "@/lib/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
