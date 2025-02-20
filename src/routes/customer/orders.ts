import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';
import { z } from 'zod';

const db = new Database('data.db');

const orderSchema = z.object({
  service_id: z.number(),
  pickup_address: z.string(),
  delivery_address: z.string(),
  cargo_type: z.string(),
  cargo_weight: z.number().positive(),
  notes: z.string().optional()
});

type ServicePricing = {
  base_price: number;
  price_per_km: number;
  price_multiplier: number;
};

type OrderResult = {
  id: number;
};

type QueryParams = [string, number];

export const customerOrderRoutes = new Elysia({ prefix: '/api/customer' })
  .post('/orders', async ({ body, headers }) => {
    const customerId = headers['x-customer-id'];
    if (!customerId) return { error: 'Unauthorized' };

    try {
      const data = orderSchema.parse(body);
      
      // Calculate total price based on service config
      const service = db.query<ServicePricing, [string, number]>(`
        SELECT 
          tm.base_price,
          tm.price_per_km,
          ct.price_multiplier
        FROM service_instances si
        JOIN service_templates st ON si.template_id = st.id
        JOIN transportation_modes tm ON st.mode_id = tm.mode_id
        JOIN cargo_types ct ON ct.type_name = ?
        WHERE si.id = ?
      `).get(data.cargo_type, data.service_id);

      if (!service) {
        return { error: 'Invalid service or cargo type' };
      }

      // Simple distance calculation (to be improved)
      const estimatedDistance = 10; // km
      const totalPrice = (service.base_price + service.price_per_km * estimatedDistance) * service.price_multiplier;

      const result = db.query<OrderResult, [number, string, string, string, string, number, number, string | null]>(`
        INSERT INTO orders (
          service_instance_id,
          customer_id,
          status,
          pickup_address,
          delivery_address,
          cargo_type,
          cargo_weight,
          total_price,
          notes,
          created_at,
          updated_at
        ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        RETURNING id
      `).get(
        data.service_id,
        customerId,
        data.pickup_address,
        data.delivery_address,
        data.cargo_type,
        data.cargo_weight,
        totalPrice,
        data.notes || null
      );

      if (!result) {
        throw new Error('Failed to create order');
      }

      // Record initial status
      db.query(`
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (?, 'pending', 'Order placed')
      `).run(result.id);

      return { 
        order_id: result.id,
        status: 'pending',
        total_price: totalPrice
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Invalid order data' };
    }
  })
  .get('/orders/:id', async ({ params, headers }) => {
    const customerId = headers['x-customer-id'];
    if (!customerId) return { error: 'Unauthorized' };

    const order = db.query(`
      SELECT 
        o.*,
        mp.name as mitra_name,
        tm.mode_name,
        d.name as driver_name
      FROM orders o
      JOIN service_instances si ON o.service_instance_id = si.id
      JOIN mitra_profiles mp ON si.mitra_id = mp.id
      JOIN service_templates st ON si.template_id = st.id
      JOIN transportation_modes tm ON st.mode_id = tm.mode_id
      LEFT JOIN drivers d ON o.driver_id = d.id
      WHERE o.id = ? AND o.customer_id = ?
    `).get(params.id, customerId);

    if (!order) {
      return { error: 'Order not found' };
    }

    const statusHistory = db.query(`
      SELECT status, notes, created_at
      FROM order_status_history
      WHERE order_id = ?
      ORDER BY created_at DESC
    `).all(params.id);

    return { ...order, status_history: statusHistory };
  }); 