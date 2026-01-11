import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    
    // Fetch all documents from each collection
    const collectionsData = await Promise.all(
      collections.map(async (collection) => {
        const collectionRef = db.collection(collection.name);
        const documents = await collectionRef.find({}).toArray();
        
        // Convert ObjectId to string for JSON serialization
        const serializedDocuments = documents.map((doc) => ({
          ...doc,
          _id: doc._id.toString(),
        }));
        
        return {
          name: collection.name,
          count: documents.length,
          documents: serializedDocuments,
        };
      })
    );
    
    // Calculate total documents
    const totalDocuments = collectionsData.reduce(
      (sum, col) => sum + col.count,
      0
    );

    return NextResponse.json({
      success: true,
      databaseName: db.databaseName,
      collections: collectionsData,
      totalDocuments,
    });
  } catch (error) {
    console.error('Error fetching database contents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch database contents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
