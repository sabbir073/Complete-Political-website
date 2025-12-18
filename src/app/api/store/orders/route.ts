import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Create a new order (public checkout)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      items,
      notes,
      delivery_fee = 0,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !customer_address) {
      return NextResponse.json(
        { error: 'Name, phone, and address are required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Calculate subtotal from items
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );
    const total = subtotal + delivery_fee;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('store_orders')
      .insert({
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        customer_address,
        subtotal,
        delivery_fee,
        total,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.product_name,
      variant_info: item.variant_info || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('store_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Return order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('store_orders')
      .select(`
        *,
        items:store_order_items(*)
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(completeOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Track order by order number and phone
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number');
    const phone = searchParams.get('phone');

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: 'Order number and phone are required' },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from('store_orders')
      .select(`
        *,
        items:store_order_items(*)
      `)
      .eq('order_number', orderNumber)
      .eq('customer_phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found. Please check your order number and phone number.' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
