import 'dotenv/config';
import * as request from 'supertest';
import { createConnection } from "typeorm";
import App from '../../src/app';

let app;
let connectionDB;
beforeAll(async () => {
  connectionDB = await createConnection();
  app = new App();
  await app.startServer();
});

afterAll(async () => {
  await app.server.close();
  await connectionDB.close();
});

it('should return number of tasks, excluding deleted tasks', async() => {
  const response = await request(app.express).get('/v1/task').send();
  expect(response.statusCode).toBe(200);
});

it('Add New Task', async() => {
  const newTask = {
    title: 'New Task for Unit Test',
    description: 'description'
  };
  const response = await request(app.express).post('/v1/task').send(newTask);
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toContain('New task added');
});
