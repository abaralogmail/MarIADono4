import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

let databasePath;

if (process.env.SQLITE_DB_PATH) {
  databasePath = process.env.SQLITE_DB_PATH;
} else {
  const candidates = [
    path.join(process.cwd(), "src", "database", "data", "MarIADono3DB.sqlite"),
    path.join(process.cwd(), "src", "database", "Data", "MarIADono3DB.sqlite"),
    path.join(process.cwd(), "Data", "MarIADono3DB.sqlite"),
  ];
  databasePath = candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch (_) {
      return false;
    }
  }) || candidates[0];
}

console.log(`📡 Database path: ${databasePath}`);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    foreignKeys: true,
  },
});

export default sequelize;
