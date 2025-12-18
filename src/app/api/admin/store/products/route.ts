import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all products with variants
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from('store_products')
      .select(`
        *,
        variants:store_product_variants(*)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(products || []);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new product with variants
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { variants, ...productData } = body;

    // Generate slug from English name
    const slug = productData.name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const { data: existingProduct } = await supabase
      .from('store_products')
      .select('slug')
      .eq('slug', slug)
      .single();

    const finalSlug = existingProduct
      ? `${slug}-${Date.now()}`
      : slug;

    // Create product
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .insert({
        ...productData,
        slug: finalSlug,
      })
      .select()
      .single();

    if (productError) throw productError;

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: product.id,
      }));

      const { error: variantsError } = await supabase
        .from('store_product_variants')
        .insert(variantsWithProductId);

      if (variantsError) throw variantsError;
    }

    // Fetch the complete product with variants
    const { data: completeProduct, error: fetchError } = await supabase
      .from('store_products')
      .select(`
        *,
        variants:store_product_variants(*)
      `)
      .eq('id', product.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(completeProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, variants, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Update product
    const { error: productError } = await supabase
      .from('store_products')
      .update(updateData)
      .eq('id', id);

    if (productError) throw productError;

    // Handle variants - delete existing and insert new ones
    if (variants !== undefined) {
      // Delete existing variants
      const { error: deleteError } = await supabase
        .from('store_product_variants')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Insert new variants
      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map((v: any) => ({
          size: v.size || null,
          color: v.color || null,
          color_code: v.color_code || null,
          price_adjustment: v.price_adjustment || 0,
          stock: v.stock || 0,
          sku: v.sku || null,
          is_active: v.is_active !== false,
          product_id: id,
        }));

        const { error: variantsError } = await supabase
          .from('store_product_variants')
          .insert(variantsWithProductId);

        if (variantsError) throw variantsError;
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct, error: fetchError } = await supabase
      .from('store_products')
      .select(`
        *,
        variants:store_product_variants(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Variants will be deleted automatically due to ON DELETE CASCADE
    const { error } = await supabase
      .from('store_products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
