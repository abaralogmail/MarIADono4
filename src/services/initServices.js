import express from 'express';
import axios from 'axios';
import BackupManager from '../utils/backupManager';
import { spawn } from 'child_process';
import SqliteManager from '../database/SqliteManager.js';
import WebServerService from './webServerService';

let n8nProcess = null; // Variable to hold the n8n child process

async function closeAllServices() {
  if (n8nProcess) {
    console.log('Gracefully stopping n8n process...');
    // Create a promise that resolves when the 'close' event is emitted
    const closePromise = new Promise(resolve => n8nProcess.on('close', resolve));

    // Send the signal to terminate
    n8nProcess.kill('SIGTERM');

    // Wait for the process to actually close before continuing
    await closePromise;
    console.log('n8n process stopped successfully.');
  }
  // Close both database connections in parallel
  const closePromises = [];

  // PostgreSQL cleanup
  /*closePromises.push(
    PostgreSQLManager.getInstance()
      .then(pgManager => pgManager.cleanup())
      .then(() => console.log('PostgreSQL connection closed successfully.'))
      .catch(error => console.error('Error closing PostgreSQL connection:', error))
  );*/

  // SQLite cleanup
  closePromises.push(
    SqliteManager.getInstance()
      .then(sqliteManager => sqliteManager.cleanup())
      .then(() => console.log('SQLite connection closed successfully.'))
      .catch(error => console.error('Error closing SQLite connection:', error))
  );

  await Promise.allSettled(closePromises);
}

async function initializeServices(app) {
  // 2. Usar el WebServerService para configurar todo lo relacionado al servidor web
  const webServer = new WebServerService();
  webServer.initializeWebServer(app);
  initializeBackupManager();
  //await initializeN8n();
  
  await initializeDatabases(); // Initialize both databases
  

  console.log('Web server and backup system initialized');
}

// Function to initialize both databases in parallel
async function initializeDatabases() {
  const initPromises = [];

  // PostgreSQL initialization
  /*initPromises.push(
    (async () => {
      try {
        console.log('Initializing PostgreSQL...');
        const pgManager = await PostgreSQLManager.getInstance();
        console.log('PostgreSQL initialized successfully');
        return pgManager;
      } catch (error) {
        console.error('Failed to initialize PostgreSQL:', error);
        throw error;
      }
    })()
  );*/

  // SQLite initialization
  initPromises.push(
    (async () => {
      try {
        console.log('Initializing SQLite...');
        const sqliteManager = await SqliteManager.getInstance();
        console.log('SQLite initialized successfully');
        return sqliteManager;
      } catch (error) {
        console.error('Failed to initialize SQLite:', error);
        throw error;
      }
    })()
  );

  await Promise.allSettled(initPromises);
}



async function gracefulShutdown() {
  try {
    console.log('Closing DuckDB connection...');
    const dbManager = await DuckDBManager.getInstance();
    await dbManager.close();
    console.log('DuckDB connection closed successfully');
    
    setTimeout(() => {
      console.log('Application shut down gracefully');
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Backup manager initialization remains unchanged
function initializeBackupManager() {
  const backupManager = new BackupManager();
  backupManager.createWeeklyBackup();
}

// n8n initialization function remains unchanged
async function initializeN8n() {
  return new Promise((resolve, reject) => {
    // Check if n8n is already running on its port
    axios.get('http://localhost:5678/', { timeout: 2000 })
      .then(() => {
        console.log('n8n is already initialized, skipping start.');
        resolve();
      })
      .catch(() => {
        // If the check fails, start n8n
        console.log('n8n is not running, starting n8n from local project dependencies...');
        
        // Determine the correct executable name based on the OS ('n8n.cmd' on Windows)
        const n8nExecutable = process.platform === 'win32' ? 'n8n.cmd' : 'n8n';
        // Construct the absolute path to the local n8n executable in node_modules
        const n8nPath = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', n8nExecutable);

        // Use spawn with the direct path to the executable.
        // This is more reliable than using 'npx' as it guarantees the local version is used.
        n8nProcess = spawn(n8nPath, [], {
          stdio: 'pipe'
          // We no longer need shell: true when using a direct path
        });

        n8nProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`n8n stdout: ${output.trim()}`);
          // n8n is ready when it prints this line
          if (output.includes('Editor is now available')) {
            console.log('n8n started successfully.');
            resolve();
          }
        });

        n8nProcess.stderr.on('data', (data) => {
          console.error(`n8n stderr: ${data.toString().trim()}`);
        });

        n8nProcess.on('close', (code) => {
          console.log(`n8n process exited with code ${code}`);
          n8nProcess = null; // Clear the process variable
        });

        n8nProcess.on('error', (err) => {
          console.error('Failed to start n8n process.', err);
          reject(err);
        });
    });
  });
}

export default { initializeServices, closeAllServices };