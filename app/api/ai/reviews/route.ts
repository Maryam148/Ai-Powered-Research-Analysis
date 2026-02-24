import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

// GET: list all saved reviews for user
export async function GET() {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabase
            .from('generated_reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ reviews: data || [] })
    } catch (error) {
        console.error('GET reviews error:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}

// POST: save a new generated review
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { title, content, review_type, paper_ids } = body

        if (!title || !content || !review_type) {
            return NextResponse.json({ error: 'title, content, and review_type are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('generated_reviews')
            .insert({
                user_id: user.id,
                title,
                content,
                review_type,
                paper_ids: paper_ids || [],
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ review: data })
    } catch (error) {
        console.error('POST review error:', error)
        return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }
}

// DELETE: remove a review by id
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id = request.nextUrl.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        const { error } = await supabase
            .from('generated_reviews')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE review error:', error)
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }
}
