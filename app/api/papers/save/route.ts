import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { paper } = body

        if (!paper || !paper.title) {
            return NextResponse.json({ error: 'Paper data is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('saved_papers')
            .insert({
                user_id: user.id,
                paper_title: paper.title,
                paper_doi: paper.id || paper.url || null,
                paper_data: paper,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Save error:', error)
        return NextResponse.json({ error: error.message || 'Failed to save paper' }, { status: 500 })
    }
}
