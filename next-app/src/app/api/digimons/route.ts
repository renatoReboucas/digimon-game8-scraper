import { NextResponse } from 'next/server'
import { loadDigimonData } from '@/lib/digimon-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await loadDigimonData())
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar os Digimon.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
