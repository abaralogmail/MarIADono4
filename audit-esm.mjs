#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

function escapeCsv(s){
  if(s==null) return '';
  return `"${String(s).replace(/"/g,'""')}"`;
}

async function* walk(dir, ignorePatterns){
  for await (const d of await fs.opendir(dir)){
    const entryPath = path.join(dir, d.name);
    const rel = path.relative(process.cwd(), entryPath);
    if(ignorePatterns.some(p => rel.startsWith(p.replace(/\*\*\/?$/,'')))) continue;
    if(d.isDirectory()){
      yield* walk(entryPath, ignorePatterns);
    }else if(d.isFile()){
      if(/\.m?js$|\.cjs$/i.test(d.name)) yield entryPath;
    }
  }
}

async function scan(){
  const ignore = ['node_modules','.git','backups','bot_sessions','dist'];
  const results = [];
  const srcDir = path.join(process.cwd(),'src');
  try{
    const stat = await fs.stat(srcDir);
    if(!stat.isDirectory()){
      console.error('No existe la carpeta src/ en el proyecto.');
      process.exit(1);
    }
  }catch(e){
    console.error('No existe la carpeta src/ en el proyecto.');
    process.exit(1);
  }
  for await (const f of walk(srcDir, ignore)){
    try{
      const txt = await fs.readFile(f,'utf8');
      const lines = txt.split(/\r?\n/);
      for(let i=0;i<lines.length;i++){
        const line = lines[i];
        if(/\brequire\(/.test(line) || /module\.exports/.test(line)){
          const pattern = /\brequire\(/.test(line) ? 'require(' : 'module.exports';
          results.push({file: path.relative(process.cwd(), f), line: i+1, pattern, snippet: line.trim()});
        }
      }
    }catch(e){
      // ignore unreadable files
    }
  }

  await fs.mkdir(path.join(process.cwd(),'docs'), { recursive: true });
  const outPath = path.join(process.cwd(),'docs','audit-cjs.csv');
  const header = 'file,line,pattern,snippet\n';
  const rows = results.map(r => `${escapeCsv(r.file)},${r.line},${escapeCsv(r.pattern)},${escapeCsv(r.snippet)}`).join('\n');
  await fs.writeFile(outPath, header + rows, 'utf8');
  console.log(`Audit complete — ${results.length} matches written to ${outPath}`);
}

scan().catch(err=>{ console.error(err); process.exit(2); });
