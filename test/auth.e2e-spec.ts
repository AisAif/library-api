import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestAppModule } from './test.app.module';
import { DataSource } from 'typeorm';
import { AuthModule } from '@/auth/auth.module';
import { createTestUser } from './helpers/user.helper';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, AuthModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    return Promise.all([dataSource.query('DELETE FROM users')]);
  });

  afterAll(async () => {
    return Promise.all([dataSource.destroy(), app.close()]);
  });

  describe('POST /auth/register', () => {
    it('should return 201', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'test',
          username: 'test',
          password: 'testtest',
          password_confirm: 'testtest',
        });

      expect(result.status).toBe(201);
      return;
    });

    it('should return 400 when field is blank', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send()
        .expect(400)
        .expect({
          message: [
            'username must be longer than or equal to 3 characters',
            'username should not be empty',
            'username must be a string',
            'name must be longer than or equal to 3 characters',
            'name should not be empty',
            'name must be a string',
            'password must be longer than or equal to 8 characters',
            'password should not be empty',
            'password must be a string',
            'password_confirm must be longer than or equal to 8 characters',
            'password_confirm should not be empty',
            'password_confirm must be a string',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when password not match', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'test',
          username: 'test',
          password: 'testtests',
          password_confirm: 'testtest',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'password not match',
          error: 'Bad Request',
        });
    });

    it('should return 400 when username already exists', async () => {
      await dataSource.query(
        'INSERT INTO users (name, username, password) VALUES (?, ?, ?)',
        ['test', 'test', 'testtest'],
      );

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'test',
          username: 'test',
          password: 'testtests',
          password_confirm: 'testtest',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'password not match',
          error: 'Bad Request',
        });
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await createTestUser(dataSource);
    });

    it('should return 200 and access token', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'testtest',
        });

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty('access_token');
      return;
    });

    it('should return 401 when username and password not match', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send()
        .expect(401);
    });
  });
});
