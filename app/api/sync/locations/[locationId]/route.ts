import { NextRequest, NextResponse } from 'next/server';
import { syncLocationData } from '@/features/data-sync/service/data-sync.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const locationId = parseInt(params.locationId, 10);

    if (isNaN(locationId)) {
      return NextResponse.json(
        { error: 'Invalid locationId' },
        { status: 400 }
      );
    }

    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    // Validate date format if provided
    if (from && isNaN(Date.parse(from))) {
      return NextResponse.json(
        { error: 'Invalid from date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (to && isNaN(Date.parse(to))) {
      return NextResponse.json(
        { error: 'Invalid to date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    const result = await syncLocationData({
      locationId,
      from,
      to,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 207, // 207 Multi-Status if partial failures
    });
  } catch (error) {
    console.error('Sync endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

