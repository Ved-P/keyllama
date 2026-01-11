import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, system_prompt } = body;

    // Validate required fields
    if (!name || !system_prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: name and system_prompt' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDatabase();
    const classesCollection = db.collection('classes');

    // Upsert the class (update if exists, insert if not)
    const result = await classesCollection.updateOne(
      { name }, // Find by name
      {
        $set: {
          name,
          system_prompt,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    // Fetch the updated/inserted document
    const savedClass = await classesCollection.findOne({ name });

    return NextResponse.json(
      {
        success: true,
        message: result.upsertedId ? 'Class created successfully' : 'Class updated successfully',
        data: savedClass,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving class:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save class', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    const db = await getDatabase();
    const classesCollection = db.collection('classes');

    if (name) {
      // Get specific class by name
      const classData = await classesCollection.findOne({ name });
      
      if (!classData) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: classData });
    } else {
      // Get all classes
      const classes = await classesCollection.find({}).toArray();
      return NextResponse.json({ data: classes });
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch classes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
