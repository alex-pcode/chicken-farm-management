import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GridContainer } from '../layout/GridContainer';

describe('GridContainer Component', () => {
  it('renders children correctly', () => {
    render(
      <GridContainer>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </GridContainer>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('applies responsive column classes correctly', () => {
    const { container } = render(
      <GridContainer columns={{ sm: 1, md: 2, lg: 3 }}>
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('applies numeric columns correctly', () => {
    const { container } = render(
      <GridContainer columns={4}>
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });

  it('applies gap classes correctly', () => {
    const { container } = render(
      <GridContainer gap="lg">
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('gap-6');
  });

  it('handles autoFit mode with inline styles', () => {
    const { container } = render(
      <GridContainer autoFit={true} minItemWidth="250px">
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(250px, 1fr))');
  });

  it('applies equalHeight classes correctly', () => {
    const { container } = render(
      <GridContainer equalHeight={true}>
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('items-stretch');
  });

  it('applies custom className', () => {
    const { container } = render(
      <GridContainer className="custom-grid">
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-grid');
  });

  it('includes test id when provided', () => {
    render(
      <GridContainer testId="test-grid-container">
        <div>Item</div>
      </GridContainer>
    );
    
    expect(screen.getByTestId('test-grid-container')).toBeInTheDocument();
  });

  it('renders without animation when animated is false', () => {
    const { container } = render(
      <GridContainer animated={false}>
        <div>Item</div>
      </GridContainer>
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement.tagName).toBe('DIV');
  });
});