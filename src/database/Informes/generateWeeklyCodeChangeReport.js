const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Genera un informe semanal de cambios en el código (últimos 7 días)
// Salidas: JSON, CSV y Markdown en src/database/Informes/outputs

(async () => {
  // Fecha límite: 7 días atrás desde ahora
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Helper: formato ISO legible
  const toISO = (d) => {
    const dt = new Date(d);
    return dt.toISOString();
  };

  // Recolectar hashes de commits en los últimos 7 días
  let commits = [];
  try {
    const hashesRaw = execSync("git log --since='7 days ago' --pretty=format:%H", { encoding: 'utf8' }).trim();
    const hashes = hashesRaw.length ? hashesRaw.split(/\r?\n/) : [];

    for (const hash of hashes) {
      // Para cada commit, obtener metadatos y archivos cambiados
      const summary = execSync(`git show --name-status --pretty=format:%H|%an|%ad|%s --date=iso ${hash}`, { encoding: 'utf8' }).trim();
      const lines = summary.split(/\r?\n/);
      const header = lines.shift(); // primera línea con metadata
      if (!header) continue;

      const [commitHash, author, date, message] = header.split('|');
      // El resto de líneas son cambios en archivos con formato STATUS<TAB>FILE
      const changes = lines
        .filter(l => l.trim().length > 0)
        .map(l => {
          const [status, file] = l.split(/\s+/, 2);
          return { status, file: file || l.trim() };
        });

      commits.push({
        hash: commitHash,
        author: author,
        date: date,
        message: message,
        changesCount: changes.length,
        changes,
      });
    }
  } catch (err) {
    console.error('Error obteniendo cambios de código:', err);
    process.exitCode = 1;
  }

  // Filtrar por fecha exacta (en caso de variaciones de hora)
  const filtered = commits.filter(c => new Date(c.date) >= sevenDaysAgo);

  // Función para calcular año/semana ISO (YYYY-WW)
  const getYearWeek = (date) => {
    const d = new Date(date);
    // Copia en UTC para evitar sesgos de zona horaria
    const dayNum = (d.getUTCDay() + 6) % 7; // 0 = lunes
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - dayNum);
    const yearStart = new Date(Date.UTC(monday.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((monday - yearStart) / 86400000 + 1) / 7);
    return `${monday.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
  };

  // Agrupar por semana
  const byWeek = {};
  filtered.forEach((c) => {
    const week = getYearWeek(c.date);
    if (!byWeek[week]) byWeek[week] = [];
    byWeek[week].push(c);
  });

  // Preparar salidas
  const timestamp = new Date().toISOString().replace(/[:\-T]/g, '').slice(0, 12); // YYYYMMDDHHMM
  const baseName = `weekly_code_changes_${timestamp}`;

  const outDir = path.resolve(__dirname, 'outputs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // JSON: una lista de commits con información clave
  const jsonPath = path.join(outDir, `${baseName}.json`);
  const jsonOutput = Object.entries(byWeek).flatMap(([week, commitsInWeek]) =>
    commitsInWeek.map((c) => ({
      week,
      hash: c.hash,
      author: c.author,
      date: c.date,
      message: c.message,
      changesCount: c.changesCount,
      changes: c.changes,
    }))
  );
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf8');

  // CSV: cada commit como fila, con resumen de cambios
  const csvPath = path.join(outDir, `${baseName}.csv`);
  const csvRows = [];
  csvRows.push(['week', 'hash', 'author', 'date', 'message', 'changesCount'].join(','));
  Object.entries(byWeek).forEach(([week, commitsInWeek]) => {
    commitsInWeek.forEach((c) => {
      const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
      csvRows.push([week, c.hash, c.author, c.date, c.message, c.changesCount].map(esc).join(','));
    });
  });
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  // Markdown: resumen legible
  const mdPath = path.join(outDir, `${baseName}.md`);
  const mdLines = [];
  mdLines.push(`# Weekly Code Changes (últimos 7 días)`);
  Object.entries(byWeek).forEach(([week, commitsInWeek]) => {
    mdLines.push(`\n## Semana ${week} (commits: ${commitsInWeek.length})`);
    commitsInWeek.forEach((c) => {
      mdLines.push(`- Hash: ${c.hash}`);
      mdLines.push(`  - Autor: ${c.author}`);
      mdLines.push(`  - Fecha: ${c.date}`);
      mdLines.push(`  - Mensaje: ${c.message}`);
      mdLines.push(`  - Cambios: ${c.changesCount}`);
    });
  });
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  console.log(`Salida generada en: ${outDir}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV : ${csvPath}`);
  console.log(`MD  : ${mdPath}`);
})();