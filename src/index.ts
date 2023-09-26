import "reflect-metadata";
import 'dotenv/config';
import { createConnection } from "typeorm";
import validateEnv from './utils/validateEnv';
import App from './app';

validateEnv();
createConnection().then(async connection => {
  await new App().startServer();
}).catch(error => console.log(error));
