import { storage } from "../server/storage";
import "dotenv/config";

async function testCreateHistory() {
  const testUserId = "e9e44e21-fc28-423f-a364-73aa82dd257d";
  console.log(`Testing createHistory for user: ${testUserId}`);
  
  try {
    const entry = await storage.createHistory({
      userId: testUserId,
      title: "Test History Entry " + new Date().toISOString(),
      type: "chat",
      content: "This is a test content.",
    });
    console.log("Success! Created entry:", entry.id);
  } catch (err: any) {
    console.error("Failed to create history entry.");
    console.error("Error Details:", err);
  }
}

testCreateHistory();
