import fs from 'fs';
import path from 'path';

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function logCtx(ctx) {
  const now = new Date();
  now.setHours(now.getHours() - 3);

  const ctxData = {
    timestamp: now.toISOString(),
    ...ctx
  };

  //console.log(JSON.stringify(ctxData, null, 2));

  // Define the new JSON logging file path
  const filePath = path.resolve(__dirname, '../../Logs/ctx_logs.json');
  ensureDirectoryExists(filePath);

  let logs = [];

  // If the JSON file already exists, read its contents
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      logs = fileContent ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.error('Error reading existing log JSON file:', error);
    }
  }

  // Append the new ctx to logs
  logs.push(ctxData);

  // Write the logs back to the JSON file
  try {
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to log JSON file:', error);
  }
}

export default { logCtx };

// Named export for compatibility
export { logCtx };
