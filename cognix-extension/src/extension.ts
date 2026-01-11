import * as vscode from 'vscode';
import { TelemetryTracker, SessionStats } from './tracker';
import { askUserDetails } from './user-info';
import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { HumanLikelihoodAnalysis } from './llm';

const uri = "mongodb+srv://patrickliu_db_user:passworducsb@cluster0.yycduow.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let tracker: TelemetryTracker;
let storedUserDetails: { fullName: string; className: string } | undefined;

/**
 * Save session data to MongoDB
 */
async function saveSessionToMongoDB(
    userDetails: { fullName: string; className: string } | undefined,
    stats: SessionStats,
    analysis: HumanLikelihoodAnalysis
): Promise<void> {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB!");

        // Get the database
        const db: Db = client.db("keyllama");
        const collection = db.collection("sessions");

        // Prepare the data to save
        const sessionData = {
            userDetails: {
                fullName: userDetails?.fullName || 'Anonymous',
                className: userDetails?.className || 'Unknown',
            },

            stats: {
                startTime: stats.startTime,
                lastEventTime: stats.lastEventTime,
                activeTimeMs: stats.activeTimeMs,
                inactiveTimeMs: stats.inactiveTimeMs,
                totalEditEvents: stats.totalEditEvents,
                charsInserted: stats.charsInserted,
                charsDeleted: stats.charsDeleted,
                pasteEventsCount: stats.pasteEvents.length,
                focusEventsCount: stats.focusEvents.length,
            },
            analysis: {
                score: analysis.score,
                reasons: analysis.reasons,
            },
            timestamp: new Date(),
        };

        // Insert the document
        const result = await collection.insertOne(sessionData);
        console.log(`Session saved to MongoDB with ID: ${result.insertedId}`);

    } catch (error) {
        console.error("Error saving to MongoDB:", error);
    } finally {
        // Close the connection
        await client.close();
    }
}

export async function activate(context: vscode.ExtensionContext) {
    // Get session info
    const userDetails = await askUserDetails();
    storedUserDetails = userDetails || undefined;  // Store it for later use

    if (!userDetails) {
        console.log("User canceled input");
    } else {
        console.log(userDetails.fullName, userDetails.className);
    }

    tracker = new TelemetryTracker();

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => {
            for (const change of e.contentChanges) {
                tracker.recordChange(change);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('keyllama.showStats', async () => {
            if (!tracker) { return; }

            const stats = tracker.getSessionStats();
            const analysis = await tracker.analyzeWithLLM();

            vscode.window.showInformationMessage(
                `Human Likelihood: ${analysis.score}%\n` +
                `Reasons:\n• ${analysis.reasons.join('\n• ')}`
            );
        })
    );
}

export async function deactivate() {
    if (tracker) {
        try {
            const stats = tracker.getSessionStats();
            const analysis = await tracker.analyzeWithLLM();

            console.log('═══════════════════════════════════════════════════════════');
            console.log('📊 Keyllama Final Human Likelihood Summary (LLM)');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`Human Likelihood Score: ${analysis.score}/100`);
            console.log('Reasons:');
            analysis.reasons.forEach((reason, i) => {
                console.log(`  ${i + 1}. ${reason}`);
            });
            console.log('');
            console.log('Session Metrics:');
            console.log(`  Total Edits: ${stats.totalEditEvents}`);
            console.log(`  Characters Inserted: ${stats.charsInserted}`);
            console.log(`  Characters Deleted: ${stats.charsDeleted}`);
            console.log(`  Paste Events: ${stats.pasteEvents.length}`);
            console.log(`  External Paste Events: ${stats.pasteEvents.filter((p) => p.external).length}`);
            console.log(`  Focus Events: ${stats.focusEvents.length}`);
            console.log(`  Active Time: ${Math.round(stats.activeTimeMs / 60000)} minutes`);
            console.log(`  Inactive Time: ${Math.round(stats.inactiveTimeMs / 60000)} minutes`);
            console.log('═══════════════════════════════════════════════════════════');

            // Save session data to MongoDB
            await saveSessionToMongoDB(storedUserDetails, stats, analysis);

        } catch (err) {
            console.error('Failed to get final LLM analysis:', err);
        }
    }
}
