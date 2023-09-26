import {getRepository} from "typeorm";
import {Request, Response, Router} from "express";
import Task from "../models/Task";
import validationInput from "../utils/validationInput";
import Controller from "../utils/controller.interface";
import errorHandler from "../utils/error.handler";
import HttpException from '../utils/http.error';
import TaskValidation from "../validation/TaskValidation";
import {TaskStatus} from "../models/enums/TaskStatus";

export default class TaskController implements Controller {
    public path = '/task';
    public router = Router();
    private taskRepository;
    private pageSize = 10;
    private page = 1;

    constructor() {
        this.initializeRoutes();
        this.taskRepository = getRepository(Task);
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getTasks.bind(this));
        this.router.post(`${this.path}`, validationInput(TaskValidation.task), this.addTask.bind(this));
        this.router.put(`${this.path}/:taskId`, validationInput(TaskValidation.task), this.updateTask.bind(this));
        this.router.delete(`${this.path}/:taskId`, this.deleteTask.bind(this));
        this.router.get(`${this.path}/stats`, this.getTaskStats.bind(this));
    }

    async getTasks(req: Request, res: Response) {
        try {
            const page = req.query.page ? req.query.page : this.page;
            const limit = req.query.limit ? req.query.limit : this.pageSize;
            let tasks = await this.taskRepository.find({
                    where:  {deleted_at: null},
                    skip: (page - 1) * limit,
                    take: limit
                });
            const count = await this.taskRepository.count();
            res.json({tasks: tasks, pagination: { page: page, limit: limit, total_pages: Math.ceil(count/limit), total_count: count}});
        }  catch (e) {
            console.log(e);
            errorHandler(new HttpException(), res);
        }
    }

    async addTask(request: Request, response: Response) {
        const input = request.body;
        try {
            const newTask = new Task();
            newTask.title = input.title;
            newTask.description = input.description;
            newTask.status = TaskStatus.NEW;
            await this.taskRepository.save(newTask);
            response.json({message : 'New task added'});
        }  catch (e) {
            console.log(e);
            errorHandler(new HttpException(), response);
        }
    }

    async updateTask(request: Request, response: Response) {
        let { taskId } = request.params;
        const input = request.body;
        try {
            let task = await this.taskRepository
                .createQueryBuilder('tasks').where('id = :taskId and deleted_at is null', { taskId: taskId })
                .getMany();
            if(task.length) {
                task[0].title = input.title;
                task[0].description = input.description;
                task[0].status = input.status;
                await this.taskRepository.save(task[0]);
                response.json({message : 'Task Updated'});
            } else {
                errorHandler(new HttpException(400, 'Task not found'), response);
            }
        }  catch (e) {
            console.log(e);
            errorHandler(new HttpException(), response);
        }
    }

    async deleteTask(request: Request, response: Response) {
        let { taskId } = request.params;
        console.log(taskId);
        try {
            let task = await this.taskRepository
                .createQueryBuilder('tasks').where('id = :taskId and deleted_at is null', { taskId: taskId })
                .getMany();
            console.log(task);
            if(task.length) {
                task[0].deleted_at = new Date();
                await this.taskRepository.save(task[0]);
                response.json({message : 'Task deleted'});
            } else {
                errorHandler(new HttpException(400, 'Task not found'), response);
            }
        }  catch (e) {
            console.log(e);
            errorHandler(new HttpException(), response);
        }
    }

    async getTaskStats(req: Request, res: Response) {
        try {
            const result = await this.taskRepository
                .createQueryBuilder('t')
                .select([
                    `TO_CHAR(t.created_at, 'Month YYYY') AS formatted_date`,
                    't.status',
                    'COUNT(*) AS status_count',
                ])
                .groupBy(['formatted_date', 't.status'])
                .orderBy('formatted_date')
                .getRawMany();

            let formattedOutput = {
              summary : {
                  new : 0,
                  in_progress : 0,
                  done : 0
              },
              detail : []
            };
            if(result.length > 0) {
                let preMonth = '';
                for(let i = 0; i < result.length; i++) {
                    if(preMonth !== result[i].formatted_date) {
                        formattedOutput.detail.push({
                            date : result[i].formatted_date,
                            metrics: {
                                new : 0,
                                in_progress : 0,
                                done : 0
                            }
                        });
                    }
                    preMonth = result[i].formatted_date;

                    switch (result[i].t_status) {
                        case TaskStatus.NEW:
                            formattedOutput.summary.new += parseInt(result[i].status_count);
                            formattedOutput.detail[formattedOutput.detail.length - 1].metrics.new = parseInt(result[i].status_count);
                            break;
                        case TaskStatus.IN_PROGRESS:
                            formattedOutput.summary.in_progress += parseInt(result[i].status_count);
                            formattedOutput.detail[formattedOutput.detail.length - 1].metrics.in_progress = parseInt(result[i].status_count);
                            break;
                        case TaskStatus.DONE:
                            formattedOutput.summary.done += parseInt(result[i].status_count);
                            formattedOutput.detail[formattedOutput.detail.length - 1].metrics.done =  parseInt(result[i].status_count);
                            break;
                    }
                }
            }
            res.json(formattedOutput);
        }  catch (e) {
            console.log(e);
            errorHandler(new HttpException(), res);
        }
    }

}