import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from 'src/schemas/appointment.schema';
import { CreateAppointmentDto } from './dtos/create-appt.dto';
import { AppointmentStatus } from 'src/schemas/message.schema';
import { MONGO_SELECT } from 'src/common/constances';
import { GetApptFilterDto } from './dtos/get-appt-filter.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
        private readonly notificationService: NotificationService,
    ) { }

    async createAppointment(appointment: CreateAppointmentDto) {
        const appt = await this.appointmentModel.create(appointment);
        this.notificationService.scheduleAppointmentReminder(appt._id.toHexString());
        return appt;
    }
    async cancelAppointmentByMessageId(messageId: string | Types.ObjectId) {
        const appointment = await this.appointmentModel.findOne({ message: new Types.ObjectId(messageId) });
        if (!appointment) {
            return null;
        }
        this.notificationService.cancelAppointmentReminder(appointment._id.toHexString());
        appointment.status = AppointmentStatus.CANCELLED;
        return await appointment.save();
    }

    async getAppointmentByUserId(userId: string, filter: GetApptFilterDto) {
        const query: any = {}
        // filter by year or month, both are optional
        if (filter.year) {
            query.date = { $gte: new Date(`${filter.year}-01-01`), $lt: new Date(`${filter.year + 1}-01-01`) }
        }
        if (filter.month) {
            query.date = { $gte: new Date(`${filter.year}-${filter.month}-01`), $lt: new Date(`${filter.year}-${filter.month + 1}-01`) }
        }

        if (filter.q) {
            query.$or = [
                { title: { $regex: filter.q, $options: 'i' } },
                { content: { $regex: filter.q, $options: 'i' } }
            ];
        }
        
        // recipient: userId or sender: userId
        return await this.appointmentModel.find({
            status: AppointmentStatus.ACCEPTED,
            $or: [{ recipient: userId }, { sender: userId }],
            ...query
        })
        .populate('sender', MONGO_SELECT.USER.DEFAULT)
        .populate('recipient', MONGO_SELECT.USER.DEFAULT);
    }
}
