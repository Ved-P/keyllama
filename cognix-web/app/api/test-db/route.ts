import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Check if environment variable is set
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          error: 'MONGODB_URI is not set in environment variables',
          hint: 'Create a .env.local file in cognix-web directory with MONGODB_URI',
          envCheck: {
            MONGODB_URI: 'MISSING',
            MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'not set (will use default)',
          },
        },
        { status: 500 }
      );
    }

    // Show connection string format (hide password)
    const uriPreview = process.env.MONGODB_URI.replace(
      /:[^:@]+@/,
      ':****@'
    );

    console.log('Attempting to connect to MongoDB...');
    console.log('URI Preview:', uriPreview);

    // Try to connect and ping the database
    const db = await getDatabase();
    
    // Ping the database to verify connection
    await db.command({ ping: 1 });

    console.log('MongoDB connection successful!');

    // Get database info
    const collections = await db.listCollections().toArray();
    const stats = await db.stats();

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB!',
      connection: {
        uriPreview,
        databaseName: db.databaseName,
        collections: collections.map((c) => c.name),
        stats: {
          collections: stats.collections,
          dataSize: `${(stats.dataSize / 1024).toFixed(2)} KB`,
          indexSize: `${(stats.indexSize / 1024).toFixed(2)} KB`,
        },
      },
      envCheck: {
        MONGODB_URI: 'SET ✓',
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'not set (using default: cognix)',
      },
    });
  } catch (error: any) {
    console.error('MongoDB connection error:', error);

    let errorDetails: any = {
      message: error.message || 'Unknown error',
    };

    // Provide specific help based on error type
    if (error.code === 8000 || error.codeName === 'AtlasError') {
      errorDetails = {
        ...errorDetails,
        issue: 'Authentication Failed',
        possibleCauses: [
          'Incorrect database password in .env.local',
          'Password contains special characters that need to be URL-encoded',
          'Database user does not exist or lacks permissions',
        ],
        solution: [
          '1. Go to MongoDB Atlas → Database Access',
          '2. Edit your user (patrickliu_db_user)',
          '3. Set a new password (avoid special characters for simplicity)',
          '4. Update MONGODB_URI in .env.local with the new password',
          '5. Make sure to replace <db_password> with your actual password (no brackets)',
          '6. Restart the dev server (npm run dev)',
        ],
      };
    } else if (error.message?.includes('ENOTFOUND')) {
      errorDetails = {
        ...errorDetails,
        issue: 'Network/DNS Error',
        possibleCauses: [
          'Cannot reach MongoDB Atlas servers',
          'Internet connection issue',
          'Incorrect cluster URL',
        ],
        solution: [
          'Check your internet connection',
          'Verify the cluster URL in your connection string',
        ],
      };
    } else if (error.message?.includes('IP')) {
      errorDetails = {
        ...errorDetails,
        issue: 'IP Not Whitelisted',
        possibleCauses: ['Your IP address is not whitelisted in MongoDB Atlas'],
        solution: [
          '1. Go to MongoDB Atlas → Network Access',
          '2. Click "Add IP Address"',
          '3. Either add your current IP or use 0.0.0.0/0 for development',
        ],
      };
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to MongoDB',
        details: errorDetails,
        envCheck: {
          MONGODB_URI: process.env.MONGODB_URI
            ? `SET (${process.env.MONGODB_URI.substring(0, 20)}...)`
            : 'MISSING',
          MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'not set (will use default)',
        },
      },
      { status: 500 }
    );
  }
}
