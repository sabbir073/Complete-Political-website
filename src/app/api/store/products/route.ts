import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch active products for public store
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('store_products')
      .select(`
        *,
        variants:store_product_variants(*)
      `)
      .eq('is_active', true);

    if (slug) {
      // Fetch single product by slug
      const { data: product, error } = await query
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        throw error;
      }

      // Filter to only active variants
      if (product && product.variants) {
        product.variants = product.variants.filter((v: any) => v.is_active);
      }

      return NextResponse.json(product);
    }

    // Fetch all products
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: products, error } = await query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter to only active variants for each product
    const productsWithActiveVariants = (products || []).map((product: any) => ({
      ...product,
      variants: (product.variants || []).filter((v: any) => v.is_active),
    }));

    return NextResponse.json(productsWithActiveVariants);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
