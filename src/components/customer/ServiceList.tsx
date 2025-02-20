import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Service = {
  service_id: number;
  mitra_name: string;
  mode_name: string;
  description: string;
  capacity_kg: number;
  base_price: number;
  price_per_km: number;
  facilities: string;
};

interface ServiceListProps {
  search?: string;
  modeId?: number;
  cargoTypeId?: number;
}

export function ServiceList({ search, modeId, cargoTypeId }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (modeId) params.append('mode_id', modeId.toString());
        if (cargoTypeId) params.append('cargo_type_id', cargoTypeId.toString());

        const response = await fetch(`/api/customer/services?${params}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch services');
        }
        
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [search, modeId, cargoTypeId]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (services.length === 0) {
    return <div className="text-gray-500 p-4 text-center">No services found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {services.map((service) => (
        <div key={service.service_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">{service.mode_name}</h3>
          <p className="text-gray-600 mb-4">{service.description}</p>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Provided by</p>
            <p className="font-medium">{service.mitra_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Capacity</p>
              <p className="font-medium">{service.capacity_kg} kg</p>
            </div>
            <div>
              <p className="text-gray-500">Base Price</p>
              <p className="font-medium">Rp {service.base_price.toLocaleString()}</p>
            </div>
          </div>
          {service.facilities && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Facilities</p>
              <div className="flex flex-wrap gap-2">
                {service.facilities.split(',').map((facility) => (
                  <span key={facility} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Link
            to={`/order/${service.service_id}`}
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded transition-colors"
          >
            Book Now
          </Link>
        </div>
      ))}
    </div>
  );
} 