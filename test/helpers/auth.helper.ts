import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const getAccessToken = async (
  app: INestApplication,
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: 'test', password: 'testtest' })
    .expect(200);

  return response.body.data.access_token;
};
