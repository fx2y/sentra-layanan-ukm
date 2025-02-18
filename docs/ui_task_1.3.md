# Web UI Documentation

## Overview
The Master Admin Dashboard provides a simple, efficient interface for managing transportation modes, cargo types, and facilities. The UI is built with vanilla HTML, CSS, and JavaScript for maximum simplicity and maintainability.

## Authentication
- Basic authentication is implemented via browser prompt
- Credentials are stored securely in localStorage after authentication
- Session persists until user logs out or clears browser data

## Features

### Transportation Modes Management
- List view showing all transportation modes with key information
- Create new transportation modes via form
- Edit existing modes by clicking "Edit" button
- Delete modes with confirmation
- Fields:
  - Mode Name
  - Description
  - Capacity (kg)
  - Base Price
  - Price per KM

### Cargo Types Management
- List view of all cargo types
- Create/Edit form with validation
- Delete with confirmation
- Fields:
  - Type Name
  - Description
  - Handling Instructions
  - Price Multiplier

### Facilities Management
- List of all available facilities
- Create/Edit functionality
- Delete with confirmation
- Ability to associate facilities with transportation modes
- Fields:
  - Name
  - Description

## Navigation
- Simple tab-based navigation between sections
- Active tab is highlighted
- All data operations occur without page reload

## Data Operations
- All forms include validation before submission
- Success/Error messages are displayed to user
- Automatic list refresh after operations
- Confirmation dialogs for destructive actions

## Styling
- Uses water.css for minimal, clean styling
- Responsive design works on mobile devices
- Simple table layouts for data display
- Clear visual hierarchy

## Error Handling
- Form validation errors shown inline
- API errors displayed in user-friendly format
- Network errors handled gracefully
- Invalid authentication redirects to login

## Best Practices
- No complex dependencies
- Progressive enhancement
- Semantic HTML
- Accessible form controls
- Clear user feedback
- Consistent UI patterns