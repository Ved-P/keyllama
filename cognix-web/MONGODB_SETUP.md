# MongoDB Atlas Setup

This project uses MongoDB Atlas for database storage.

## Setup Instructions

### 1. Get Your MongoDB Atlas Credentials

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account or sign in
3. Create a new cluster (if you don't have one)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)

### 2. Configure Environment Variables

Create a file named `.env.local` in the `cognix-web` directory with the following content:

```bash
# MongoDB Atlas Configuration
# Replace <username>, <password>, and <cluster-url> with your actual credentials
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority

# Optional: Specify database name (defaults to 'cognix' if not set)
MONGODB_DB_NAME=cognix
```

**Important:** Replace the placeholders in the connection string:
- `<username>` - Your MongoDB Atlas database username
- `<password>` - Your MongoDB Atlas database password
- `<cluster-url>` - Your cluster URL (e.g., cluster0.xxxxx.mongodb.net)

### 3. Whitelist Your IP Address

In MongoDB Atlas:
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Either add your current IP or click "Allow Access from Anywhere" (0.0.0.0/0) for development

### 4. Install Dependencies

Run the following command to install the MongoDB driver:

```bash
npm install
```

### 5. Test the Connection

Start the development server:

```bash
npm run dev
```

Try creating a class to test if the database connection works.

## Database Schema

### Classes Collection

Each class document contains:

```typescript
{
  _id: ObjectId,
  name: string,              // Class name (e.g., "CS 16 — Intro to Algorithms")
  system_prompt: string,     // Generated system prompt with rules
  created_at: Date,
  updated_at: Date
}
```

## API Endpoints

- `POST /api/classes` - Create or update a class
- `GET /api/classes` - Get all classes
- `GET /api/classes?name=<className>` - Get a specific class by name
