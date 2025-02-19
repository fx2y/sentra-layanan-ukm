import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

export const driverRoutes = new Elysia({ prefix: '/mitra' })
  .get('/service-instances/:id/drivers', async ({ params, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    // Verify service instance belongs to mitra
    const serviceInstance = db.query(
      'SELECT id FROM service_instances WHERE id = ? AND mitra_id = ?'
    ).get(params.id, mitraId);

    if (!serviceInstance) return { error: 'Service instance not found' };

    const drivers = db.query(`
      SELECT d.* 
      FROM drivers d
      WHERE d.service_instance_id = ?
    `).all(params.id);

    return drivers;
  })
  .post('/service-instances/:id/drivers', async ({ params, body, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    // Verify service instance belongs to mitra
    const serviceInstance = db.query(
      'SELECT id FROM service_instances WHERE id = ? AND mitra_id = ?'
    ).get(params.id, mitraId);

    if (!serviceInstance) return { error: 'Service instance not found' };

    const { name, phone, vehicle_info } = body as any;

    const result = db.query(`
      INSERT INTO drivers (service_instance_id, name, phone, vehicle_info, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      RETURNING id
    `).get(params.id, name, phone, JSON.stringify(vehicle_info));

    return { id: result.id };
  })
  .get('/drivers/:id', async ({ params, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    const driver = db.query(`
      SELECT d.* 
      FROM drivers d
      JOIN service_instances si ON d.service_instance_id = si.id
      WHERE d.id = ? AND si.mitra_id = ?
    `).get(params.id, mitraId);

    return driver || { error: 'Driver not found' };
  })
  .put('/drivers/:id', async ({ params, body, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    const { name, phone, vehicle_info } = body as any;

    db.query(`
      UPDATE drivers d
      SET name = ?, phone = ?, vehicle_info = ?, updated_at = datetime('now')
      WHERE d.id = ? 
      AND EXISTS (
        SELECT 1 FROM service_instances si 
        WHERE si.id = d.service_instance_id 
        AND si.mitra_id = ?
      )
    `).run(name, phone, JSON.stringify(vehicle_info), params.id, mitraId);

    return { success: true };
  })
  .delete('/drivers/:id', async ({ params, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    db.query(`
      DELETE FROM drivers 
      WHERE id = ? 
      AND EXISTS (
        SELECT 1 FROM service_instances si 
        WHERE si.id = drivers.service_instance_id 
        AND si.mitra_id = ?
      )
    `).run(params.id, mitraId);

    return { success: true };
  }); 