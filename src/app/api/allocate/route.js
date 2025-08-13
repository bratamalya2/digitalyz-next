import { NextResponse } from 'next/server';
import { generateAllocationSuggestions } from '../../../lib/openai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;

    // Validate request data
    if (!data || !data.clientData || !data.workerData || !data.taskData) {
      return NextResponse.json(
        { error: 'Missing required data fields' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate allocation suggestions
    const result = await generateAllocationSuggestions(data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestions: result.suggestions,
      usage: result.usage
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Allocation API endpoint. Use POST to get allocation suggestions.' },
    { status: 200 }
  );
}