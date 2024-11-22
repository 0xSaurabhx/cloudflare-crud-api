import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../src/index';

const mockD1Database = {
  prepare: vi.fn(),
};

const testUsers = [
  {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

describe('User API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      mockD1Database.prepare.mockReturnValue({
        all: () => ({ results: testUsers })
      });

      const request = new Request('http://example.com/api/users', {
        method: 'GET'
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(testUsers);
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        'SELECT id, name, email, created_at, updated_at FROM users'
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: () => ({
          all: () => ({ results: [testUsers[0]] })
        })
      });

      const request = new Request('http://example.com/api/users/1', {
        method: 'GET'
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(testUsers[0]);
    });

    it('should return 404 if user not found', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: () => ({
          all: () => ({ results: [] })
        })
      });

      const request = new Request('http://example.com/api/users/999', {
        method: 'GET'
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: () => ({
          run: () => ({ success: true })
        })
      });

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };

      const request = new Request('http://example.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);

      expect(response.status).toBe(201);
    });

    it('should return 400 if required fields are missing', async () => {
      const request = new Request('http://example.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: () => ({
          run: () => ({ success: true })
        })
      });

      const updateUser = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const request = new Request('http://example.com/api/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateUser)
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: () => ({
          run: () => ({ success: true })
        })
      });

      const request = new Request('http://example.com/api/users/1', {
        method: 'DELETE'
      });
      const ctx = createExecutionContext();
      const response = await worker.fetch(request, { DB: mockD1Database }, ctx);

      expect(response.status).toBe(200);
    });
  });
});