import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = 'agenda_salao.db';

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
};

const runMigrations = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS clients(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS services(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      durationMin INTEGER NOT NULL,
      defaultPrice REAL,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      durationMin INTEGER NOT NULL,
      clientId INTEGER NOT NULL,
      serviceId INTEGER NOT NULL,
      price REAL,
      status TEXT NOT NULL CHECK(status IN ('MARCADO','CONCLUIDO','FALTOU','CANCELADO')),
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, startTime);
    CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(clientId);
    CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(serviceId);
  `);

  const seeded = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'seed_v1'`
  );

  if (!seeded?.value) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO services(name, durationMin, defaultPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)` ,
      'Corte Feminino',
      60,
      80,
      now,
      now,
      'Escova',
      45,
      50,
      now,
      now
    );

    await db.runAsync(
      `INSERT INTO clients(name, phone, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)` ,
      'Ana Souza',
      '(11) 99999-1111',
      'Prefere atendimento pela manhã',
      now,
      now,
      'Beatriz Lima',
      '(11) 98888-2222',
      'Alérgica a alguns produtos',
      now,
      now
    );

    await db.runAsync(`INSERT INTO meta(key, value) VALUES ('seed_v1', '1')`);
  }
};

export const initDatabase = async () => {
  const db = await getDb();
  await runMigrations(db);
};
