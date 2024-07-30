import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestAppModule } from './test.app.module';
import { DataSource } from 'typeorm';
import { createTestUser } from './helpers/user.helper';
import { getAccessToken } from './helpers/auth.helper';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { Book, BookStatus } from '@/books/books.entity';
import { createTestBook } from './helpers/book.helpers';

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
      await dataSource.query('DELETE FROM books');
      await dataSource.query('DELETE FROM users');
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

  describe('GET /books', () => {
    beforeEach(async () => {
      const user = await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );

      await createTestBook(
        {
          title: 'test',
          author: 'test',
          year: '2003',
          total_page: 99,
          summary: 'test',
          user: user,
        },
        dataSource,
      );
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM books');
      await dataSource.query('DELETE FROM users');
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .get('/books')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      expect(result.body.data.data.length).toBe(1);
      expect(result.body.data.data[0].title).toBe('test');
      return;
    });
  });

  describe('GET /books/:id', () => {
    let book: Book;

    beforeEach(async () => {
      const user = await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );

      book = await createTestBook(
        {
          title: 'test',
          author: 'test',
          year: '2003',
          total_page: 99,
          summary: 'test',
          user: user,
        },
        dataSource,
      );
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM books');
      await dataSource.query('DELETE FROM users');
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .get('/books/' + book.id)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      expect(result.body.data).toStrictEqual({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        total_page: book.total_page,
        summary: book.summary,
        status: book.status,
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString(),
      });
      return;
    });

    it('should return 404 when id not found', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .get('/books/' + book.id + 1)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(404);
      return;
    });

    it('should return 404 when book does not belong to user', async () => {
      const anotherUser = await createTestUser(
        {
          name: 'test2',
          username: 'test2',
          password: 'test2',
        },
        dataSource,
      );

      const anotherBook = await createTestBook(
        {
          title: 'test2',
          author: 'test2',
          total_page: 99,
          user: anotherUser,
          year: '2003',
        },
        dataSource,
      );

      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .get('/books/' + anotherBook.id)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(404);
      return;
    });
  });

  describe('PATCH /books/:id', () => {
    let book: Book;

    beforeEach(async () => {
      const user = await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );

      book = await createTestBook(
        {
          title: 'test',
          author: 'test',
          year: '2003',
          total_page: 99,
          summary: 'test',
          user: user,
        },
        dataSource,
      );
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM books');
      await dataSource.query('DELETE FROM users');
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/books/' + book.id)
        .send({
          title: 'updated',
          summary: 'updated',
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      return;
    });

    it('should return 200 when just updating status', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/books/' + book.id)
        .send({
          status: BookStatus.IN_READING,
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      return;
    });

    it('should return 400 when form is invalid', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/books/' + book.id + 1)
        .send({
          title: '',
          total_page: -1,
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(400);
      expect(result.body.message.length).toBe(2);
      return;
    });

    it('should return 404 when id not found', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/books/' + book.id + 1)
        .send({
          title: 'updated',
          summary: 'updated',
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(404);
      return;
    });

    it('should return 404 when book does not belong to user', async () => {
      const anotherUser = await createTestUser(
        {
          name: 'test2',
          username: 'test2',
          password: 'test2',
        },
        dataSource,
      );

      const anotherBook = await createTestBook(
        {
          title: 'test2',
          author: 'test2',
          total_page: 99,
          user: anotherUser,
          year: '2003',
        },
        dataSource,
      );

      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .patch('/books/' + anotherBook.id)
        .send({
          title: 'updated',
          summary: 'updated',
        })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(404);
      return;
    });
  });

  describe('DELETE /books/:id', () => {
    let book: Book;

    beforeEach(async () => {
      const user = await createTestUser(
        {
          name: 'test',
          username: 'test',
          password: 'testtest',
        },
        dataSource,
      );

      book = await createTestBook(
        {
          title: 'test',
          author: 'test',
          year: '2003',
          total_page: 99,
          summary: 'test',
          user: user,
        },
        dataSource,
      );
    });

    afterEach(async () => {
      await dataSource.query('DELETE FROM books');
      await dataSource.query('DELETE FROM users');
    });

    it('should return 200', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .delete('/books/' + book.id)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(200);
      return;
    });

    it('should return 400 when id not found or not belong to user', async () => {
      const accessToken = await getAccessToken('test', 'testtest', app);
      const result = await request(app.getHttpServer())
        .delete('/books/' + book.id + 1)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(result.status).toBe(404);
      return;
    });
  });
});
