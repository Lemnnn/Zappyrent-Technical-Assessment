import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  describe('Auth Flow', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user, login, and access protected routes', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/users/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user).toHaveProperty('id');
      expect(registerResponse.body.user.email).toBe(testUser.email);

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send(testUser)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      const token = loginResponse.body.accessToken;

      // Access protected route (create book)
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: 2023,
      };

      await request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${token}`)
        .send(bookData)
        .expect(201);

      // Get user's books
      const booksResponse = await request(app.getHttpServer())
        .get('/books')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(booksResponse.body)).toBe(true);
      expect(booksResponse.body.length).toBeGreaterThan(0);
      expect(booksResponse.body[0]).toHaveProperty('title', bookData.title);
    });

    it('should not allow access to protected routes without token', async () => {
      await request(app.getHttpServer()).get('/books').expect(401);
    });

    it('should not allow registration with existing email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/users/register')
        .send(testUser)
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/users/register')
        .send(testUser)
        .expect(409); // Conflict
    });

    it('should not allow login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
