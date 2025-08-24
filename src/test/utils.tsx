// Test utilities for Chicken Manager testing
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AllTheProviders } from './mockComponents';

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };
// eslint-disable-next-line react-refresh/only-export-components
export * from './mockData';
// eslint-disable-next-line react-refresh/only-export-components
export * from './mockComponents';