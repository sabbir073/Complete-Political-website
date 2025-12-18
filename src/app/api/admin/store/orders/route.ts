import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all orders with items
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
      .from('store_orders')
      .select(`
        *,
        items:store_order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data: order, error } = await supabase
      .from('store_orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        items:store_order_items(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete an order (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Order items will be deleted automatically due to ON DELETE CASCADE
    const { error } = await supabase
      .from('store_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
