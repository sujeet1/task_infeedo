import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import {TaskStatus} from "../models/enums/TaskStatus";

class TaskValidation {
    public task: ObjectSchema;

    constructor() {
        this.task = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            status: Joi.string().valid(
                TaskStatus.NEW,
                TaskStatus.IN_PROGRESS,
                TaskStatus.DONE
            ),
        });
    }
}

export default new TaskValidation();