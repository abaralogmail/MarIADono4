// scripts/seed.js
import 'dotenv/config';
import { seedHorarios } from '../seeders/horariosSeeder.js';
import SqliteManager from '../SqliteManager.js';

async function runSeeders() {
  console.log('🚀 Iniciando proceso de sembrado de base de datos...');
  try {
    // Ejecuta los seeders que necesites
    await seedHorarios();

    console.log('✅ Proceso de sembrado completado exitosamente.');
  } catch (error) {
    console.error('❌ Error durante el proceso de sembrado:', error);
    process.exit(1);
  } finally {
    await (await SqliteManager.getInstance()).cleanup();
  }
}

runSeeders();