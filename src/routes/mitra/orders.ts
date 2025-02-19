import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

export const orderRoutes = new Elysia({ prefix: '/mitra' })
  .get('/orders', async ({ query, headers }) => {
    const mitraId = headers['x-mitra-id'];
    if (!mitraId) return { error: 'Unauthorized' };

    const serviceInstanceId = query?.service_instance_id;
    let sql = `
      SELECT o.id, o.status, o.pickup_address, o.delivery_address, o.cargo_type,
             si.id as service_instance_id, si.config as service_config,
             d.name as driver_name
      FROM orders o
      JOIN service_instances si ON o.service_instance_id = si.id
      LEFT JOIN drivers d ON o.driver_id = d.id
      WHERE si.mitra_id = ?
    `;
    const params = [mitraId];

    if (serviceInstanceId) {
      sql += ' AND si.id = ?';
      params.push(serviceInstanceId);
    }

    sql += ' ORDER BY o.created_at DESC';
    
    const orders = db.query(sql).all(...params);
    return orders;
  }); 