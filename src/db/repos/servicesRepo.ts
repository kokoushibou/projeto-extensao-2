import { getDb } from '../database';
import { Service } from '../../types/models';

export const servicesRepo = {
  async list(): Promise<Service[]> {
    const db = await getDb();
    return db.getAllAsync<Service>(`SELECT * FROM services ORDER BY name ASC`);
  },

  async getById(id: number): Promise<Service | null> {
    const db = await getDb();
    return (await db.getFirstAsync<Service>(`SELECT * FROM services WHERE id = ?`, id)) ?? null;
  },

  async create(data: Omit<Service, 'id'>) {
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO services(name, durationMin, defaultPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      data.name,
      data.durationMin,
      data.defaultPrice ?? null,
      now,
      now
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Service, 'id'>>) {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE services SET name = ?, durationMin = ?, defaultPrice = ?, updatedAt = ? WHERE id = ?`,
      data.name,
      data.durationMin,
      data.defaultPrice ?? null,
      now,
      id
    );
  },

  async remove(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM services WHERE id = ?`, id);
  },
};
