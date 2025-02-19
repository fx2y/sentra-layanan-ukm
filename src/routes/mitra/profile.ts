import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

export const mitraProfileRoutes = new Elysia({ prefix: '/mitra' })
  .get('/profile', async ({ headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    const profile = db.query('SELECT * FROM mitra_profiles WHERE id = ?').get(mitraId);
    return profile || { error: 'Profile not found' };
  })
  .put('/profile', async ({ body, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    const { name, address, contact_info } = body as any;
    
    db.query(`
      UPDATE mitra_profiles 
      SET name = ?, address = ?, contact_info = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, address, contact_info, mitraId);

    return { success: true };
  }); 