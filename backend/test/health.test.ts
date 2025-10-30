import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('GET /api/health', () => {
  it('returns ok true and version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
    expect(typeof res.body.version).toBe('string');
  });
});