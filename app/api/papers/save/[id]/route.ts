import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

export async function POST(
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
        const body = await req.json()
        const { aiSummary } = body

        if (!id || !aiSummary) {
            return NextResponse.json({ error: 'Paper ID and Summary are required' }, { status: 400 })
        }

        // Fetch current paper_data to preserve it
        const { data: existingData, error: fetchError } = await supabase
            .from('saved_papers')
            .select('paper_data')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError) throw fetchError;

        const updatedPaperData = {
            ...existingData.paper_data as Record<string, unknown>, // cast to object so we can spread
            aiSummary
        }

        const { data, error } = await supabase
            .from('saved_papers')
            .update({ paper_data: updatedPaperData })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, paper: data })
    } catch (error) {
        console.error('Update summary error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update paper summary' }, { status: 500 })
    }
}
