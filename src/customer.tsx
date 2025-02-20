import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CustomerApp } from './components/customer/App';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

const root = createRoot(container);
root.render(
  <StrictMode>
    <CustomerApp />
  </StrictMode>
); 