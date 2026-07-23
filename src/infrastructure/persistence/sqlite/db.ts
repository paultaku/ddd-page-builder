import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

// SQLite connection singleton. SERVER-ONLY: better-sqlite3 is a native Node
// addon and must never be pulled into a client bundle. It is imported only by
// the Sqlite* repository adapters, which are imported only by route handlers
// (every one declares `export const runtime = "nodejs"`) and the migration
// script — never by a client component.
//
// The database file lives under the same gitignored `.data/` dir the file store
// uses (`.data/app.db`). Schema DDL is idempotent (CREATE TABLE IF NOT EXISTS)
// and runs on first open — MVP auto-migrate, no separate migration tool.

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "app.db");

// Tables mirror the aggregates (see plan §2.3). JSON columns for
// sites.colorPalette + sites.pageIds; booleans stored as INTEGER 0/1.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS pages (
  uuid        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  html        TEXT NOT NULL,
  css         TEXT NOT NULL,
  ownerId     TEXT NOT NULL,
  createdAt   TEXT NOT NULL,
  updatedAt   TEXT NOT NULL,
  published   INTEGER NOT NULL DEFAULT 0,
  publishedAt TEXT,
  slug        TEXT,
  templateId  TEXT,
  purchaseUrl TEXT
);

CREATE TABLE IF NOT EXISTS sites (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  ownerId      TEXT NOT NULL,
  templateId   TEXT NOT NULL,
  colorPalette TEXT NOT NULL,
  pageIds      TEXT NOT NULL,
  createdAt    TEXT NOT NULL,
  updatedAt    TEXT NOT NULL,
  published    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,
  filename   TEXT NOT NULL,
  mimeType   TEXT NOT NULL,
  size       INTEGER NOT NULL,
  dataUrl    TEXT NOT NULL,
  category   TEXT,
  ownerId    TEXT NOT NULL,
  uploadedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_categories (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS entitlements (
  ownerId   TEXT NOT NULL,
  moduleKey TEXT NOT NULL,
  state     TEXT NOT NULL,
  PRIMARY KEY (ownerId, moduleKey)
);

CREATE TABLE IF NOT EXISTS user_templates (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  tier      TEXT NOT NULL,
  source    TEXT NOT NULL,
  ownerId   TEXT,
  thumbnail TEXT,
  html      TEXT NOT NULL,
  css       TEXT NOT NULL
);
`;

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const conn = new Database(DB_PATH);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    conn.exec(SCHEMA);
    db = conn;
  }
  return db;
}
