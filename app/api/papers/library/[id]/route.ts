import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient() as unknown as SupabaseClient<Database>
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('saved_papers')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
            }
            throw error
        }

        return NextResponse.json({ paper: data })
    } catch (error: unknown) {
        console.error('Fetch single paper error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch paper' }, { status: 500 })
    }
}
