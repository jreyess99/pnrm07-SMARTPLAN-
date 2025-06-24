import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import mongoose from 'mongoose';

// Mock fetch global para evitar llamadas reales a la API de Ticketmaster
(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      _embedded: {
        events: [
          { id: '1', name: 'Evento Test', classifications: [{ segment: { name: 'Cultura' } }], _embedded: { venues: [{ location: { latitude: '0', longitude: '0' }, address: { line1: 'Test' }, city: { name: 'TestCity' } }] }, dates: { start: { localDate: '2024-01-01', localTime: '20:00' } }, images: [{ url: 'test.jpg' }], url: 'https://test.com' }
        ]
      }
    })
  })
);

describe('Auth y rutas generales', () => {
  it('debe registrar un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'testuser@example.com', password: '123456' });
    expect([200, 400]).toContain(res.status); // 400 si ya existe
  });

  it('debe loguear un usuario existente', async () => {
    await request(app)
      .post('/api/register')
      .send({ email: 'testlogin@example.com', password: '123456' });
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testlogin@example.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('debe responder 401 si login es incorrecto', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'noexiste@example.com', password: 'mal' });
    expect(res.status).toBe(401);
  });

  it('debe responder 404 para rutas inexistentes', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.status).toBe(404);
  });

  it('debe responder 400 si el correo ya está registrado', async () => {
    await request(app)
      .post('/api/register')
      .send({ email: 'testuser2@example.com', password: '123456' });
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'testuser2@example.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  it('debe responder 401 si la contraseña es incorrecta', async () => {
    await request(app)
      .post('/api/register')
      .send({ email: 'testuser3@example.com', password: '123456' });
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'testuser3@example.com', password: 'incorrecta' });
    expect(res.status).toBe(401);
  });

  it('debe responder 400 si falta el password en registro', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'sinpass@example.com' });
    expect(res.status).toBe(400);
  });

  it('debe responder 400 si falta el email en registro', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  it('debe responder 400 si falta el email en login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ password: '123456' });
    expect(res.status).toBe(400);
  });

  it('debe responder 400 si falta el password en login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'alguien@example.com' });
    expect(res.status).toBe(400);
  });

  it('debe responder 200 en la ruta base /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Servidor funcionando correctamente');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
