import { getDb } from '../database';
import { Client } from '../../types/models';

export const clientsRepo = {
  async list(search?: string): Promise<Client[]> {
    const db = await getDb();
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      return db.getAllAsync<Client>(
        `SELECT * FROM clients WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC`,
        term,
        term
      );
    }
    return db.getAllAsync<Client>(`SELECT * FROM clients ORDER BY name ASC`);
  },

  async getById(id: number): Promise<Client | null> {
    const db = await getDb();
    return (await db.getFirstAsync<Client>(`SELECT * FROM clients WHERE id = ?`, id)) ?? null;
  },

  async create(data: Omit<Client, 'id'>) {
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO clients(name, phone, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      data.name,
      data.phone ?? null,
      data.notes ?? null,
      now,
      now
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Client, 'id'>>) {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE clients SET name = ?, phone = ?, notes = ?, updatedAt = ? WHERE id = ?`,
      data.name,
      data.phone ?? null,
      data.notes ?? null,
      now,
      id
    );
  },

  async remove(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM clients WHERE id = ?`, id);
  },
};
