import { Response } from 'express';
import HttpException from './http.error';

function errorHandler(error: HttpException, res: Response): void {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.status(status).send({ 'message': message });
}

export default errorHandler;