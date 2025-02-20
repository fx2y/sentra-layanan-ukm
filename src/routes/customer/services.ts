import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const db = new Database('data.db');

export const customerServiceRoutes = new Elysia({ prefix: '/api/customer' })
  .get('/services', async ({ query }) => {
    const { search, mode_id, cargo_type_id } = query;
    
    let sql = `
      SELECT 
        si.id as service_id,
        si.config as service_config,
        mp.name as mitra_name,
        mp.contact_info as mitra_contact,
        tm.mode_name,
        tm.description,
        tm.capacity_kg,
        tm.base_price,
        tm.price_per_km,
        GROUP_CONCAT(f.name) as facilities
      FROM service_instances si
      JOIN mitra_profiles mp ON si.mitra_id = mp.id
      JOIN service_templates st ON si.template_id = st.id
      JOIN transportation_modes tm ON st.mode_id = tm.mode_id
      LEFT JOIN mode_facilities mf ON tm.mode_id = mf.mode_id
      LEFT JOIN facilities f ON mf.facility_id = f.facility_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(mp.name LIKE ? OR tm.mode_name LIKE ? OR tm.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (mode_id) {
      conditions.push('tm.mode_id = ?');
      params.push(mode_id);
    }

    if (cargo_type_id) {
      conditions.push('EXISTS (SELECT 1 FROM cargo_types ct WHERE ct.cargo_type_id = ?)');
      params.push(cargo_type_id);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY si.id';

    const services = db.query(sql).all(...params);
    return services;
  })
  .get('/services/:id', async ({ params }) => {
    const service = db.query(`
      SELECT 
        si.id as service_id,
        si.config as service_config,
        mp.name as mitra_name,
        mp.contact_info as mitra_contact,
        tm.mode_name,
        tm.description,
        tm.capacity_kg,
        tm.base_price,
        tm.price_per_km,
        GROUP_CONCAT(f.name) as facilities
      FROM service_instances si
      JOIN mitra_profiles mp ON si.mitra_id = mp.id
      JOIN service_templates st ON si.template_id = st.id
      JOIN transportation_modes tm ON st.mode_id = tm.mode_id
      LEFT JOIN mode_facilities mf ON tm.mode_id = mf.mode_id
      LEFT JOIN facilities f ON mf.facility_id = f.facility_id
      WHERE si.id = ?
      GROUP BY si.id
    `).get(params.id);

    if (!service) {
      return { error: 'Service not found' };
    }

    return service;
  }); 