import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

export const serviceInstanceRoutes = new Elysia({ prefix: '/mitra/service-instances' })
  .get('/', async ({ headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };
    const instances = db.query(`
      SELECT si.*, st.name as template_name 
      FROM service_instances si
      JOIN service_templates st ON si.template_id = st.id
      WHERE si.mitra_id = ?
    `).all(mitraId);
    return instances;
  })
  .post('/', async ({ body, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };
    const { template_id, config } = body as any;
    const result = db.query(`
      INSERT INTO service_instances (mitra_id, template_id, config, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      RETURNING id
    `).get(mitraId, template_id, JSON.stringify(config));
    return { id: result.id };
  })
  .get('/:id', async ({ params, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };
    const instance = db.query(`
      SELECT si.*, st.name as template_name 
      FROM service_instances si
      JOIN service_templates st ON si.template_id = st.id
      WHERE si.id = ? AND si.mitra_id = ?
    `).get(params.id, mitraId);
    return instance || { error: 'Service instance not found' };
  })
  .put('/:id', async ({ params, body, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };
    const { config } = body as any;
    db.query(`
      UPDATE service_instances 
      SET config = ?, updated_at = datetime('now')
      WHERE id = ? AND mitra_id = ?
    `).run(JSON.stringify(config), params.id, mitraId);
    return { success: true };
  })
  .delete('/:id', async ({ params, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };
    
    db.query(`
      DELETE FROM service_instances 
      WHERE id = ? AND mitra_id = ?
    `).run(params.id, mitraId);
    
    return { success: true };
  }); 