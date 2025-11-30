import fs from 'fs/promises';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./edtech.db');

db.exec('PRAGMA foreign_keys = ON;');

const sql = fs.readFile('./queries.sql');
db.exec(sql);
console.log('SQLite database created & seeded using built-in node:sqlite!');
