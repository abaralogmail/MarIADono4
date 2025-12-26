import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const runScript = (scriptPath) => {
  try {
    // Use absolute path to avoid working directory issues
    const absPath = path.isAbsolute(scriptPath) ? scriptPath : path.join(__dirname, scriptPath);
    console.log(`Executing script: ${absPath}`);
    // Execute the script with Node and capture stdout
    const output = execSync(`node ${absPath}`, { encoding: 'utf8', stdio: 'pipe' });
    return output;
  } catch (err) {
    // Include both stdout and stderr if available for diagnostics
    const stdout = err.stdout || '';
    const stderr = err.stderr || err.message || '';
    return `Error executing ${scriptPath}:\n${stdout}\n${stderr}`;
  }
};

// Paths are relative to this directory (Informes/). These files live in the same folder.
const monthlyScript = './generateMonthlyBotMessageReport.js';
const weeklyScript = './generateWeeklyBotMessageReport.js';

console.log('=== Iniciando Agents_InsightInforme ===');

const monthlyOutput = runScript(monthlyScript);
const weeklyOutput = runScript(weeklyScript);

let report = '';
report += '# Agents Insight Informe\n\n';
report += '## Informe Mensual (bot mensajes por mes)\n';
report += '```monthly\n';
report += monthlyOutput;
report += '\n```\n\n';
report += '## Informe Semanal (bot mensajes por semana)\n';
report += '```weekly\n';
report += weeklyOutput;
report += '\n```\n';
report += `\nGenerated at ${new Date().toISOString()}\n`;

const outputPath = path.join(__dirname, 'Agents_InsightInforme_output.md');
fs.writeFileSync(outputPath, report, 'utf8');
console.log(`Informe generado en: ${outputPath}`);
console.log('=== Fin de Agents_InsightInforme ===');
