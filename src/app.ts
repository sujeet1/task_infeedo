import * as express from "express";
import { Application, Request, Response, NextFunction } from "express";
import * as compression from 'compression';
import * as cors from 'cors';
import * as morgan from 'morgan';
import Controller from "./utils/controller.interface";
import TaskController from './controller/TaskController';

export default class App {
  public express: Application;
  public server;

  constructor() {
    this.initialiseMiddleware();
    this.addControllers(new TaskController());
  }

  private initialiseMiddleware(): void {
    this.express = express();
    this.express.use(cors());
    this.express.use(morgan('dev'));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
    this.express.use(function(err, req: Request, res: Response, next: NextFunction) {
      // error handling logic
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
  }

  public addControllers(controller: Controller):void {
    this.express.use('/v1', controller.router);
  }

  public async startServer(): Promise<void> {
    this.server = await this.express.listen(process.env.PORT);
    console.log(`Express server has started on port ${process.env.PORT}.`);
  }
}
