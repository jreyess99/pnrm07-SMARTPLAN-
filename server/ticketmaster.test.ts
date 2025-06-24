import app from './app';
import request from 'supertest';
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

describe('GET /api/ticketmaster', () => {
  it('debe responder con 200 y al menos 1 evento', async () => {
    const res = await request(app).get('/api/ticketmaster');
    expect(res.status).toBe(200);
    expect(res.body._embedded?.events?.length).toBeGreaterThan(0);
  });

  it('debe responder 400 si falta la API key de Ticketmaster', async () => {
    const original = process.env.REACT_APP_TICKETMASTER_API_KEY;
    process.env.REACT_APP_TICKETMASTER_API_KEY = '';
    const res = await request(app).get('/api/ticketmaster');
    expect(res.status).toBe(500);
    process.env.REACT_APP_TICKETMASTER_API_KEY = original;
  });

  it('debe responder 500 si ocurre un error en fetch', async () => {
    (global as any).fetch = jest.fn(() => Promise.reject('error'));
    const res = await request(app).get('/api/ticketmaster');
    expect(res.status).toBe(500);
  });

  it('debe responder 500 si ocurre un error inesperado en /api/ticketmaster', async () => {
    // Simula un error lanzando excepción en fetch
    (global as any).fetch = jest.fn(() => { throw new Error('error inesperado'); });
    const res = await request(app).get('/api/ticketmaster');
    expect(res.status).toBe(500);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
