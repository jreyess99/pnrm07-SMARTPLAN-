import app from './app';
import request from 'supertest';
import mongoose from 'mongoose';

let token: string;
let panoramaId = 'panorama-rate-123';

describe('Ratings y reportes', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({ email: 'ratetest@example.com', password: '123456' });
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'ratetest@example.com', password: '123456' });
    token = res.body.token;
  });

  it('debe calificar un panorama', async () => {
    const res = await request(app)
      .post(`/api/panoramas/${panoramaId}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Excelente' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Calificación guardada');
  });

  it('debe rechazar calificación sin rating', async () => {
    const res = await request(app)
      .post(`/api/panoramas/${panoramaId}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Falta rating' });
    expect(res.status).toBe(400);
  });

  it('debe obtener ratings de un panorama', async () => {
    await request(app)
      .post(`/api/panoramas/${panoramaId}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Bueno' });
    const res = await request(app)
      .get(`/api/panoramas/${panoramaId}/ratings`);
    expect(res.status).toBe(200);
    expect(res.body.ratings).toBeInstanceOf(Array);
  });

  it('debe reportar un panorama', async () => {
    const res = await request(app)
      .post(`/api/panoramas/${panoramaId}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Contenido inapropiado' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reporte enviado');
  });

  it('debe rechazar reporte sin motivo', async () => {
    const res = await request(app)
      .post(`/api/panoramas/${panoramaId}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ });
    expect(res.status).toBe(400);
  });

  it('debe obtener cantidad de favoritos global', async () => {
    const res = await request(app)
      .get(`/api/favorites-count/${panoramaId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
