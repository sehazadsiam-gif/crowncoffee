import { NextResponse } from "next/server";
import { addOrder, getOrders } from "@/lib/data";
import { broadcastOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// GET /api/orders — return all orders (for manager initial load)
export async function GET() {
  try {
    const store = await getOrders();
    return NextResponse.json(store.orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

// POST /api/orders — place a new order from a table QR scan or delivery
export async function POST(request) {
  try {
    const body = await request.json();
    const { tableNumber, items, totalPrice, specialNote, deliveryAddress, deliveryCharge, customerName, customerContact } = body;

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const order = await addOrder({
      tableNumber,
      items,
      totalPrice,
      specialNote: specialNote || "",
      deliveryAddress: deliveryAddress || null,
      deliveryCharge: deliveryCharge || 0,
      customerName: customerName || null,
      customerContact: customerContact || null,
    });

    // Push to all connected manager SSE clients
    broadcastOrder(order);

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
