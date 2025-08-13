import { NextResponse } from 'next/server';
import { analyzeDataWithAI } from '../../../lib/openai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, analysisType } = body;

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

    // Perform analysis
    const result = await analyzeDataWithAI(data, analysisType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
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
    { message: 'Analysis API endpoint. Use POST to analyze data.' },
    { status: 200 }
  );
}