import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

export async function GET() {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('saved_papers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ papers: data })
    } catch (error) {
        console.error('Library fetch error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch library' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(req.url)
        const id = url.searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Saved Paper ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('saved_papers')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Library delete error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete paper' }, { status: 500 })
    }
}
