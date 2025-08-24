// Mock components for testing
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock providers for testing
export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-auth-provider">{children}</div>
);

export const MockDataProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-data-provider">{children}</div>
);

// Custom render function with all providers
export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <MockDataProvider>
          {children}
        </MockDataProvider>
      </MockAuthProvider>
    </BrowserRouter>
  );
};