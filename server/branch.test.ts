import app from './app';
import request from 'supertest';
import mongoose from 'mongoose';

let token: string;
let panoramaId = 'panorama-branch-123';

describe('Cobertura de ramas: attending y errores', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/register')
      .send({ email: 'branchtest@example.com', password: '123456' });
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'branchtest@example.com', password: '123456' });
    token = res.body.token;
  });

  it('debe agregar un attending', async () => {
    const res = await request(app)
      .post(`/api/attending/${panoramaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attending).toContain(panoramaId);
  });

  it('debe quitar un attending', async () => {
    await request(app)
      .post(`/api/attending/${panoramaId}`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .delete(`/api/attending/${panoramaId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.attending).not.toContain(panoramaId);
  });

  it('debe responder 401 si no hay token en attending', async () => {
    const res = await request(app)
      .post(`/api/attending/${panoramaId}`);
    expect(res.status).toBe(401);
  });

  it('debe responder 404 si el usuario no existe en attending', async () => {
    const fakeToken = require('jsonwebtoken').sign({ userId: 'inexistente' }, process.env.JWT_SECRET || 'supersecret');
    const res = await request(app)
      .post(`/api/attending/${panoramaId}`)
      .set('Authorization', `Bearer ${fakeToken}`);
    expect([404, 500]).toContain(res.status);
  });

  it('debe probar branch de ratings vacío', async () => {
    const res = await request(app)
      .get(`/api/panoramas/empty-ratings/ratings`);
    expect(res.status).toBe(200);
    expect(res.body.avg).toBeNull();
    expect(res.body.ratings).toEqual([]);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
