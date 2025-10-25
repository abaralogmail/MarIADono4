const SqliteManager = require("../SqliteManager");

const seedConversationsLog = async () => {
  let sqliteManager;
  try {
    sqliteManager = await SqliteManager.getInstance();
    const ConversationsLog = sqliteManager.models.ConversationsLog;

    const today = new Date();
    const currentWeekDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = today.toTimeString().slice(0, 8); // HH:MM:SS

    const sampleLogs = [
      {
        date: currentWeekDate,
        time: currentTime,
        from: "5491123456789",
        role: "bot",
        pushName: "TestUser1",
        body: "Hello from BotA!",
        messageId: "MSG12345",
        etapaEmbudo: "Initial",
        interesCliente: "ProductA",
        botName: "BotA",
      },
      {
        date: currentWeekDate,
        time: currentTime,
        from: "5491198765432",
        role: "bot",
        pushName: "TestUser2",
        body: "How can I help you today?",
        messageId: "MSG67890",
        etapaEmbudo: "FollowUp",
        interesCliente: "ServiceB",
        botName: "BotB",
      },
      {
        date: currentWeekDate,
        time: currentTime,
        from: "5491123456789",
        role: "user", // User message, should not be counted by the report
        pushName: "TestUser1",
        body: "I need more info.",
        messageId: "MSG54321",
        etapaEmbudo: "Initial",
        interesCliente: "ProductA",
        botName: "BotA",
      },
      {
        date: "2025-10-10", // Date outside current week, should not be counted
        time: "10:00:00",
        from: "5491111111111",
        role: "bot",
        pushName: "OldUser",
        body: "Old message from BotC",
        messageId: "MSGOLD1",
        etapaEmbudo: "Old",
        interesCliente: "OldProduct",
        botName: "BotC",
      },
    ];

    console.log("Seeding ConversationsLog with sample data...");
    for (const log of sampleLogs) {
      await ConversationsLog.create(log);
    }
    console.log("ConversationsLog seeded successfully.");
  } catch (error) {
    console.error("Error seeding ConversationsLog:", error);
  } finally {
    if (sqliteManager) {
      await sqliteManager.cleanup();
    }
  }
};

seedConversationsLog();
