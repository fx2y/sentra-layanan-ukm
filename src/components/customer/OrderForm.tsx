import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type CargoType = {
  type_name: string;
  description: string;
  handling_instructions: string;
  price_multiplier: number;
};

type Service = {
  service_id: number;
  mitra_name: string;
  mode_name: string;
  description: string;
  capacity_kg: number;
  base_price: number;
  price_per_km: number;
};

type OrderResponse = {
  order_id: number;
  status: string;
  total_price: number;
  error?: string;
};

type ApiResponse<T> = T & {
  error?: string;
};

export const OrderForm: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pickup_address: '',
    delivery_address: '',
    cargo_type: '',
    cargo_weight: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [serviceRes, cargoTypesRes] = await Promise.all([
          fetch(`/api/customer/services/${serviceId}`),
          fetch('/api/cargo-types')
        ]);

        const [serviceData, cargoTypesData] = await Promise.all([
          serviceRes.json(),
          cargoTypesRes.json()
        ]) as [ApiResponse<Service>, ApiResponse<CargoType[]>];

        if (!serviceRes.ok) throw new Error(serviceData.error || 'Failed to fetch service');
        if (!cargoTypesRes.ok) throw new Error(cargoTypesData.error || 'Failed to fetch cargo types');

        setService(serviceData);
        setCargoTypes(cargoTypesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-id': '1' // TODO: Get from auth context
        },
        body: JSON.stringify({
          service_id: service.service_id,
          pickup_address: formData.pickup_address,
          delivery_address: formData.delivery_address,
          cargo_type: formData.cargo_type,
          cargo_weight: parseFloat(formData.cargo_weight),
          notes: formData.notes || undefined
        })
      });

      const data = await response.json() as OrderResponse;
      if (!response.ok) throw new Error(data.error || 'Failed to place order');

      navigate(`/orders/${data.order_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (!service) {
    return <div className="text-gray-500 p-4 text-center">Service not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Place Order</h2>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{service.mode_name}</h3>
          <p className="text-gray-600">{service.description}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Provided by: {service.mitra_name}</p>
            <p>Capacity: {service.capacity_kg} kg</p>
            <p>Base Price: Rp {service.base_price.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pickup_address" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Address
            </label>
            <input
              id="pickup_address"
              type="text"
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter pickup address"
            />
          </div>

          <div>
            <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <input
              id="delivery_address"
              type="text"
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter delivery address"
            />
          </div>

          <div>
            <label htmlFor="cargo_type" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo Type
            </label>
            <select
              id="cargo_type"
              name="cargo_type"
              value={formData.cargo_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select cargo type</option>
              {cargoTypes.map(type => (
                <option key={type.type_name} value={type.type_name}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cargo_weight" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo Weight (kg)
            </label>
            <input
              id="cargo_weight"
              type="number"
              name="cargo_weight"
              value={formData.cargo_weight}
              onChange={handleChange}
              required
              min="0"
              max={service.capacity_kg.toString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter cargo weight"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter any additional notes"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              submitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}; 