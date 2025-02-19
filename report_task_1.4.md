# Report Task 1.4 - Mitra Admin Dashboard

## Overview

This task implemented the Mitra Admin Dashboard for service and driver management. The implementation includes Bun API endpoints, a web UI, data access using SQLite, basic authentication with Mitra-level authorization, seed data for initialization, and deployment instructions. Detailed documentation is available in:
- [API Documentation](docs/api_endpoints_task_1.4.md)
- [UI Documentation](docs/ui_task_1.4.md)
- [Seed Data Documentation](docs/seed_data_task_1.4.md)
- [Deployment Documentation](docs/deployment_task_1.3.md)

## Implemented API Endpoints

- **Mitra Profile:**
  - GET `/mitra/profile`
  - PUT `/mitra/profile`

- **Service Instances:**
  - GET `/mitra/service-instances`
  - POST `/mitra/service-instances`
  - GET `/mitra/service-instances/:id`
  - PUT `/mitra/service-instances/:id`
  - DELETE `/mitra/service-instances/:id`

- **Drivers:**
  - GET `/mitra/service-instances/:id/drivers`
  - POST `/mitra/service-instances/:id/drivers`
  - GET `/mitra/drivers/:id`
  - PUT `/mitra/drivers/:id`
  - DELETE `/mitra/drivers/:id`

- **Orders:**
  - GET `/mitra/orders`

## UI Components & Data Flow

- **UI Components:**
  - The dashboard uses a tab navigation system (Profile, Services, Drivers, Orders) with forms and list views. 
  - Several components (e.g., tab navigation, form layouts, list cards, button styles) were reused from the Master Admin Dashboard (Task 1.3) to maintain consistency and reduce duplication.

- **Data Flow & Authorization:**
  - The Bun API endpoints interact with a SQLite database, with data isolation based on the Mitra Admin's ID (provided via the custom header `x-mitra-id`).
  - Basic authentication is implemented in the `index.ts` file. The API checks for valid credentials (hardcoded for the Mitra Admin role) and enforces that only resources associated with the authenticated Mitra are accessible.

## Seed Data & Deployment

- **Seed Data:**
  - The seed script (`scripts/seed_mitra_data.ts`) populates the database with a sample Mitra profile, service instance (linked to an existing service template), and drivers. 

- **Deployment:**
  - The backend and frontend are deployed on a single VM using Bun, with Caddy as the reverse proxy and Systemd for service management.
  - Detailed deployment instructions and configurations are documented in [Deployment Documentation](docs/deployment_task_1.3.md).

## Design Decisions & Challenges

- **Reuse of Components:**
  - UI components and API routing patterns were reused from Task 1.3 to ensure a consistent look and feel. This decision helped reduce development time and leverage proven solutions for common UI patterns.

- **Routing Consistency:**
  - A routing parameter conflict was resolved by standardizing on `:id` for service instance identification, preventing overlaps between service instance and driver routes.

- **Simplifications:**
  - For simplicity, basic authentication and input validation are implemented. The solution uses hardcoded credentials and a single Mitra Admin role, with plans to extend to full RBAC in a future task.

## Testing & Access Instructions

- **Access the Mitra Admin Dashboard UI:**
  - URL: `http://localhost/mitra`
  - Credentials: Username: `mitra_admin`, Password: `password`

- **Testing API Endpoints:**
  - Use tools like Postman or cURL. Include a Basic authentication header with base64 encoding of `mitra_admin:password` and set the header `x-mitra-id` to `1`.
  - Test cross-Mitra access by providing an incorrect or missing `x-mitra-id` header to verify access is correctly restricted.

- **Setup Steps:**
  1. Run `bun install` to install dependencies.
  2. Initialize the SQLite database by running `cat sql/*.sql | sqlite3 data.db`.
  3. Load seed data using `bun run scripts/seed_mitra_data.ts`.
  4. Start the server with `bun run src/index.ts`.

## Conclusion

Task 1.4 successfully implemented the Mitra Admin Dashboard with dedicated API endpoints and a web UI. All components are documented, and the deployment process has been updated for a smooth rollout on the target VM. This task lays the foundation for further enhancements and fine-grained role-based access control in future tasks. 