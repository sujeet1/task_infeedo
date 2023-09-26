import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from './enums/TaskStatus';

@Entity('tasks')
export default class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.NEW,
    })
    status: TaskStatus;

    @Column({ type: 'timestamp', default: null, nullable: true })
    deleted_at: Date;

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}