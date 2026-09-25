// @ts-nocheck
import { NextResponse } from 'next/server';
import { loadDigimonData } from '@/lib/digimon-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await loadDigimonData());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
