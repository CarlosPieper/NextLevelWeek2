import { Request, Response } from 'express';
import convertHourToMinutes from '../utils/convertHourToMinutes';
import db from '../database/connection';

interface ScheduleItem {
    week_day: number;
    from: string,
    to: string
}

export default class ClassesController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        const weekday = filters.week_day as string;
        const subject = filters.subject as string;
        const time = filters.time as string;

        if (!weekday || !subject || !time)
            return response.status(400).json({
                error: "Missing filters to search classes"
            });

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(weekday)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return response.json(classes);
    }

    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;

        var transaction = await db.transaction();

        try {
            const insertedUserIds = await transaction('users').insert({
                name, avatar, whatsapp, bio
            });

            const user_id = insertedUserIds[0];

            const insertedClassesIds = await transaction('classes').insert({
                subject,
                cost,
                user_id
            });

            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to),
                };
            });

            await transaction('class_schedule').insert(classSchedule);

            await transaction.commit();

            return response.status(201).json();
        } catch{
            return response.status(400).json({
                error: "Unexpected error while creating class"
            })
        }
    }
}