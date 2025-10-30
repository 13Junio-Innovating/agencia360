import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the products repo to avoid Supabase
vi.mock('../src/repo/products', () => ({
  listProducts: vi.fn().mockResolvedValue([
    { id: 'p1', name: 'Plano Básico', price: 99.9 },
    { id: 'p2', name: 'Plano Pro', price: 199.9 },
  ])
}));

import { app } from '../src/index';

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: 'p1', name: 'Plano Básico' });
  });
});