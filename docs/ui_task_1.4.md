# Mitra Admin Dashboard UI Documentation

## Overview

The Mitra Admin Dashboard provides a web interface for UKM business owners (Mitra Admins) to manage their:
- Business profile
- Service instances
- Drivers
- Orders

The UI is built using HTML, Tailwind CSS, and vanilla JavaScript, focusing on simplicity and usability.

## Components

### Navigation

The dashboard uses a tab-based navigation system with four main sections:
- Profile
- Services
- Drivers
- Orders

Each tab is accessible via the top navigation bar and loads its respective content dynamically.

### Profile Management

The Profile tab contains:
- Business name input
- Address textarea
- Contact information section
  - Phone number input
  - Email input
- Save changes button

Changes are saved automatically when the form is submitted.

### Service Instance Management

The Services tab includes:
- "New Service" button to create service instances
- List of existing service instances showing:
  - Service template name
  - Service configuration details
    - Service area
    - Operating hours
    - Vehicle types
  - Edit and Delete actions

### Driver Management

The Drivers tab features:
- "Add Driver" button
- List of drivers grouped by service instance showing:
  - Driver name
  - Contact information
  - Vehicle details
  - Edit and Delete actions

### Order List

The Orders tab displays:
- List of orders showing:
  - Order ID
  - Status
  - Driver assignment
  - Pickup and delivery addresses
  - Cargo type

## Styling

The UI uses Tailwind CSS for styling with a consistent color scheme:
- Primary color: Indigo (600)
- Background: Gray (100)
- Cards: White with Gray (50) for list items
- Text: Gray (900) for headings, Gray (600) for body text

## Responsive Design

The dashboard is responsive and works well on:
- Desktop (1024px and above)
- Tablet (768px to 1023px)
- Mobile (below 768px)

## JavaScript Functionality

The main JavaScript file (`app.js`) handles:
- Tab navigation
- Data loading for each section
- Form submissions
- API interactions
- Data formatting and display

## Error Handling

The UI handles common errors by:
- Displaying appropriate error messages
- Maintaining data consistency
- Preventing invalid form submissions

## Reused Components

The following components from the Master Admin Dashboard (task 1.3) are reused:
- Tab navigation system
- Form layouts
- List view cards
- Button styles
- Loading states

## Security

The UI implements basic security measures:
- Basic authentication
- Input validation
- XSS prevention
- CSRF protection (via headers)

## Performance

Performance optimizations include:
- Lazy loading of tab content
- Efficient DOM updates
- Minimal dependencies
- Cached API responses where appropriate 