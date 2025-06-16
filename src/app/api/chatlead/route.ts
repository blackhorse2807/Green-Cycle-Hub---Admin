import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For now, just log the data and return success
    console.log('Chat lead received:', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing chat lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat lead' },
      { status: 500 }
    );
  }
} 