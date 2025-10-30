import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Products from './Products';

// Mock the products service
vi.mock('../services/products', () => ({
  fetchProducts: vi.fn(),
}));
import { fetchProducts } from '../services/products';

// Mock CartContext provider to avoid needing full app
vi.mock('../store/CartContext', () => ({
  useCart: () => ({ addItem: vi.fn() })
}));

describe('Products page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading initially', () => {
    (fetchProducts as any).mockResolvedValueOnce([]);
    render(<Products />);
    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
  });

  it('renders empty state when no products', async () => {
    (fetchProducts as any).mockResolvedValueOnce([]);
    render(<Products />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum produto disponível.')).toBeInTheDocument();
    });
  });

  it('renders products returned by service', async () => {
    (fetchProducts as any).mockResolvedValueOnce([
      { id: 'p1', name: 'Plano Básico', price: 99.9 },
      { id: 'p2', name: 'Plano Pro', price: 199.9 },
    ]);
    render(<Products />);
    await waitFor(() => {
      expect(screen.getByText('Plano Básico')).toBeInTheDocument();
      expect(screen.getByText('Plano Pro')).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    (fetchProducts as any).mockRejectedValueOnce(new Error('fail'));
    render(<Products />);
    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar produtos.')).toBeInTheDocument();
    });
  });
});