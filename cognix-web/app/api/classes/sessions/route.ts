import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');

    const db = await getDatabase();
    const sessionsCollection = db.collection('sessions');

    let query = {};
    if (className && className !== 'all') {
      query = { 'userDetails.className': className };
    }

    // Fetch sessions sorted by timestamp (newest first)
    const sessions = await sessionsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    // Serialize the data
    const serializedSessions = sessions.map((session) => ({
      ...session,
      _id: session._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedSessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
