import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestAppModule } from './test.app.module';
import { DataSource } from 'typeorm';
import { createTestUser } from './helpers/user.helper';
import { getAccessToken } from './helpers/auth.helper';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { Book } from '@/books/books.entity';

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

  describe('POST /books', () => {
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
      return Promise.all([
        dataSource.query('DELETE FROM books'),
        dataSource.query('DELETE FROM users'),
      ]);
    });

    it('should return 201', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'test',
          author: 'test',
          total_page: 99,
          year: '2003',
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(201);
      const book = await dataSource.getRepository(Book).findOne({
        where: { title: 'test' },
      });
      expect(book.id).toBeDefined();
      expect(book.title).toBe('test');
      expect(book.author).toBe('test');
      expect(book.total_page).toBe(99);
      expect(book.year).toBe('2003');
      expect(book.created_at).toBeDefined();
      expect(book.updated_at).toBeDefined();
      return;
    });

    it('should return 400 when field is blank', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      return request(app.getHttpServer())
        .post('/books')
        .send()
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
        .expect({
          message: [
            'title must be longer than or equal to 3 characters',
            'title must be a string',
            'title should not be empty',
            'author must be a string',
            'author should not be empty',
            'total_page must not be less than 1',
            'total_page must be a number conforming to the specified constraints',
            'total_page should not be empty',
            'year must be longer than or equal to 4 characters',
            'year must be a string',
            'year should not be empty',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
