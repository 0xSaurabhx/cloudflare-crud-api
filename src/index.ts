import { hash, compare } from 'bcryptjs';

interface Env {
  DB: D1Database;
}

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // GET all users (password excluded)
      if (request.method === 'GET' && path === '/api/users') {
        const { results } = await env.DB.prepare(
          'SELECT id, name, email, created_at, updated_at FROM users'
        ).all();
        return Response.json(results);
      }

      // GET single user
      if (request.method === 'GET' && path.match(/^\/api\/users\/\d+$/)) {
        const id = path.split('/')[3];
        const { results } = await env.DB.prepare(
          'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?'
        ).bind(id).all();
        
        if (results.length === 0) {
          return new Response('User not found', { status: 404 });
        }
        return Response.json(results[0]);
      }

      // POST create user
      if (request.method === 'POST' && path === '/api/users') {
        const user: User = await request.json();
        
        if (!user.name || !user.email || !user.password) {
          return new Response('Name, email and password are required', { status: 400 });
        }

        // Hash password
        const hashedPassword = await hash(user.password, 10);

        const { success } = await env.DB.prepare(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
        )
        .bind(user.name, user.email, hashedPassword)
        .run();

        if (!success) {
          return new Response('Failed to create user', { status: 500 });
        }
        return new Response('User created successfully', { status: 201 });
      }

      // PUT update user
      if (request.method === 'PUT' && path.match(/^\/api\/users\/\d+$/)) {
        const id = path.split('/')[3];
        const user: User = await request.json();

        const updates = [];
        const bindings = [];
        
        if (user.name) {
          updates.push('name = ?');
          bindings.push(user.name);
        }
        if (user.email) {
          updates.push('email = ?');
          bindings.push(user.email);
        }
        if (user.password) {
          updates.push('password = ?');
          bindings.push(await hash(user.password, 10));
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        bindings.push(id);

        const { success } = await env.DB.prepare(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        )
        .bind(...bindings)
        .run();

        if (!success) {
          return new Response('Failed to update user', { status: 500 });
        }
        return new Response('User updated successfully', { status: 200 });
      }

      // DELETE user
      if (request.method === 'DELETE' && path.match(/^\/api\/users\/\d+$/)) {
        const id = path.split('/')[3];
        const { success } = await env.DB.prepare(
          'DELETE FROM users WHERE id = ?'
        )
        .bind(id)
        .run();

        if (!success) {
          return new Response('Failed to delete user', { status: 500 });
        }
        return new Response('User deleted successfully', { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      if (error instanceof Error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      } else {
        return new Response('Unknown error', { status: 500 });
      }
    }
  },
};
