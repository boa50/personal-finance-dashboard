import { NextResponse } from 'next/server'
import { getData } from '@/app/data/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

export async function GET() {
    try {
        const data = await getData()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching financial data:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch financial data' },
            { status: 500 }
        )
    }
}
