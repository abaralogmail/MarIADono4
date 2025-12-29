/**
 * Tests de integración para middlewares de Auth JWT y RBAC
 * - Ubicación: [`src/tests/auth.test.js`](src/tests/auth.test.js:1)
 *
 * Ejecutar con: npm test (o jest) según configuración del proyecto.
 */

const request = require('supertest');
const express = require('express');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

const { authJwt, generateToken } = require('../middleware/authJwt');
const { clearRoleCache } = require('../middleware/rbac');

describe('Auth JWT + RBAC integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Ruta protegida que requiere permiso 'test:access'
    app.post(
      '/protected',
      authJwt({ required: true }),
      require('../middleware/rbac').rbac(['test:access']),
      (req, res) => {
        res.status(200).json({ ok: true, user: req.user || null });
      }
    );
  });

  afterEach(() => {
    // limpiar caché entre tests
    clearRoleCache();
  });

  test('sin token -> 401', async () => {
    await request(app).post('/protected').send({}).expect(401);
  });

  test('token inválido -> 401', async () => {
    await request(app)
      .post('/protected')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({})
      .expect(401);
  });

  test('token válido pero sin permisos -> 403', async () => {
    const token = generateToken({ id: 1, role_id: 1, permissions: [] });
    await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(403);
  });

  test('token válido con permiso requerido -> 200', async () => {
    const token = generateToken({ id: 2, role_id: 2, permissions: ['test:access'] });
    const res = await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
  });

  test('token expirado -> 401', async () => {
    // generar token con expiración muy corta
    const token = generateToken({ id: 3, role_id: 3, permissions: ['test:access'] }, { expiresIn: '1ms' });
    // esperar para que expire
    await new Promise((r) => setTimeout(r, 20));
    await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(401);
  });
});