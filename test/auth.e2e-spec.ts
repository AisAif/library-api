import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestAppModule } from './test.app.module';
import { DataSource } from 'typeorm';
import { createTestUser } from './helpers/user.helper';
import { getAccessToken } from './helpers/auth.helper';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { User } from '@/users/users.entity';
import * as bcrypt from 'bcrypt';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    return Promise.all([dataSource.destroy(), app.close()]);
  });

  describe('POST /auth/register', () => {
    afterEach(async () => {
      return Promise.all([dataSource.query('DELETE FROM users')]);
    });

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
          message: ['password not match'],
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
          password: 'testtest',
          password_confirm: 'testtest',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['username already exists'],
          error: 'Bad Request',
        });
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );
    });

    afterEach(async () => {
      return Promise.all([dataSource.query('DELETE FROM users')]);
    });

    it('should return 200 and access token', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'testtest',
        });

      expect(result.status).toBe(200);
      expect(result.body.data).toHaveProperty('access_token');
      return;
    });

    it('should return 401 when username and password not match', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send()
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    beforeEach(async () => {
      await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );
    });

    afterEach(async () => {
      return Promise.all([dataSource.query('DELETE FROM users')]);
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      expect(result.body.data).toHaveProperty('username');
      expect(result.body.data).toHaveProperty('name');
      return;
    });

    it('should return 401 when access token not provided or invalid', async () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('PATCH /auth/profile', () => {
    beforeEach(async () => {
      await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );
    });

    afterEach(async () => {
      return Promise.all([dataSource.query('DELETE FROM users')]);
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/auth/profile')
        .send({
          name: 'test1',
          username: 'test1',
          password: 'testtest1',
          password_confirm: 'testtest1',
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      const user = await dataSource.getRepository(User).findOneBy({
        username: 'test1',
      });
      expect(user.username).toBe('test1');
      expect(user.name).toBe('test1');
      expect(await bcrypt.compare('testtest1', user.password)).toBe(true);
      return;
    });

    it('should return 400 when password not empty but password_confirm empty', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      return request(app.getHttpServer())
        .patch('/auth/profile')
        .send({
          password: 'testtest1',
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
        .expect({
          message: [
            'password_confirm should not be empty',
            'password_confirm must be longer than or equal to 8 characters',
            'password_confirm must be a string',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when username already exist', async () => {
      await createTestUser(
        {
          name: 'test1',
          username: 'test1',
          password: 'testtest1',
        },
        dataSource,
      );

      const accessToken = await getAccessToken('test', 'testtest', app);
      return request(app.getHttpServer())
        .patch('/auth/profile')
        .send({
          username: 'test1',
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
        .expect({
          message: ['username already exists'],
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
