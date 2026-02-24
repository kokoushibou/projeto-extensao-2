import { getDb } from '../database';
import { Appointment, AppointmentListItem, AppointmentStatus, ClientHistoryItem } from '../../types/models';

export const appointmentsRepo = {
  async listByDate(date: string): Promise<AppointmentListItem[]> {
    const db = await getDb();
    return db.getAllAsync<AppointmentListItem>(
      `SELECT a.*, c.name as clientName, s.name as serviceName
       FROM appointments a
       INNER JOIN clients c ON c.id = a.clientId
       INNER JOIN services s ON s.id = a.serviceId
       WHERE a.date = ?
       ORDER BY a.startTime ASC`,
      date
    );
  },

  async listByClient(clientId: number): Promise<ClientHistoryItem[]> {
    const db = await getDb();
    return db.getAllAsync<ClientHistoryItem>(
      `SELECT a.*, c.name as clientName, s.name as serviceName
       FROM appointments a
       INNER JOIN clients c ON c.id = a.clientId
       INNER JOIN services s ON s.id = a.serviceId
       WHERE a.clientId = ?
       ORDER BY a.date DESC, a.startTime DESC`,
      clientId
    );
  },

  async getById(id: number): Promise<Appointment | null> {
    const db = await getDb();
    return (await db.getFirstAsync<Appointment>(`SELECT * FROM appointments WHERE id = ?`, id)) ?? null;
  },

  async checkConflict(date: string, startTime: string, ignoreId?: number): Promise<boolean> {
    const db = await getDb();
    const whereIgnore = ignoreId ? 'AND id != ?' : '';
    const query = `SELECT id FROM appointments WHERE date = ? AND startTime = ? ${whereIgnore} LIMIT 1`;
    const row = ignoreId
      ? await db.getFirstAsync<{ id: number }>(query, date, startTime, ignoreId)
      : await db.getFirstAsync<{ id: number }>(query, date, startTime);

    return Boolean(row?.id);
  },

  async create(data: Omit<Appointment, 'id'>) {
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO appointments(date, startTime, durationMin, clientId, serviceId, price, status, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      data.date,
      data.startTime,
      data.durationMin,
      data.clientId,
      data.serviceId,
      data.price ?? null,
      data.status,
      data.notes ?? null,
      now,
      now
    );
    return result.lastInsertRowId;
  },

  async update(id: number, data: Partial<Omit<Appointment, 'id'>>) {
    const db = await getDb();
    const current = await this.getById(id);
    if (!current) return;

    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE appointments
       SET date = ?, startTime = ?, durationMin = ?, clientId = ?, serviceId = ?, price = ?, status = ?, notes = ?, updatedAt = ?
       WHERE id = ?`,
      data.date ?? current.date,
      data.startTime ?? current.startTime,
      data.durationMin ?? current.durationMin,
      data.clientId ?? current.clientId,
      data.serviceId ?? current.serviceId,
      data.price ?? current.price ?? null,
      data.status ?? current.status,
      data.notes ?? current.notes ?? null,
      now,
      id
    );
  },

  async updateStatus(id: number, status: AppointmentStatus) {
    const db = await getDb();
    await db.runAsync(`UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ?`, status, new Date().toISOString(), id);
  },

  async remove(id: number) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM appointments WHERE id = ?`, id);
  },
};
