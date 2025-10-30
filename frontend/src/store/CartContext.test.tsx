import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

function wrapper({ children }: any) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CartContext', () => {
  beforeEach(() => {
    // Reset localStorage between tests
    localStorage.clear();
  });

  it('adds new item with qty=1 and computes total', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'p1', name: 'Produto', price: 50 });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].qty).toBe(1);
    expect(result.current.total).toBe(50);
  });

  it('increments qty when adding same item again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'p1', name: 'Produto', price: 50 });
      result.current.addItem({ id: 'p1', name: 'Produto', price: 50 });
    });
    expect(result.current.items[0].qty).toBe(2);
    expect(result.current.total).toBe(100);
  });

  it('removes item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'p1', name: 'Produto', price: 50 });
      result.current.removeItem('p1');
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'p1', name: 'A', price: 10 });
      result.current.addItem({ id: 'p2', name: 'B', price: 15 });
      result.current.clear();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});