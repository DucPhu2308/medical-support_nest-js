import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from 'src/schemas/appointment.schema';
import { CreateAppointmentDto } from './dtos/create-appt.dto';
import { AppointmentStatus } from 'src/schemas/message.schema';
import { MONGO_SELECT } from 'src/common/constances';
import { GetApptFilterDto } from './dtos/get-appt-filter.dto';
import { NotificationService } from 'src/notification/notification.service';
import { GeneralNotificationDto } from 'src/notification/dtos/general-notification.dto';

@Injectable()
export class AppointmentService {
    getAllAppointments() {
        return this.appointmentModel.find();
    }
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
        private readonly notificationService: NotificationService,
    ) { }

    async getAppointmentById(id: string) {
        return await this.appointmentModel.findById(id)
            .populate('sender', MONGO_SELECT.USER.DEFAULT)
            .populate('recipient', MONGO_SELECT.USER.DEFAULT);
    }

    async createAppointment(appointment: CreateAppointmentDto) {
        const appt = await this.appointmentModel.create(appointment);
        this.notificationService.scheduleAppointmentReminder(appt._id.toHexString());

        const noti: GeneralNotificationDto = {
            // sender is the creator of the appointment, send noti when the recipient accepts the appointment
            recipient: appt.sender, 
            content: `Cuộc hẹn "${appointment.title}" đã được xác nhận`,
            actionUrl: `/appointment/${appt._id}`
        }
        this.notificationService.pushGeneralNotificationToQueue(noti);
        return appt;
    }
    async cancelAppointmentByMessageId(messageId: string | Types.ObjectId, actorId: string) {
        const appointment = await this.appointmentModel.findOne({ message: new Types.ObjectId(messageId) });
        if (!appointment) {
            return null;
        }
        this.notificationService.cancelAppointmentReminder(appointment._id.toHexString());

        const notiRecipient = appointment.sender.toHexString() === actorId ? appointment.recipient : appointment.sender;
        const noti: GeneralNotificationDto = {
            recipient: notiRecipient,
            content: `Cuộc hẹn "${appointment.title}" đã bị hủy`,
            actionUrl: `/appointment/${appointment._id}`
        }
        this.notificationService.pushGeneralNotificationToQueue(noti);

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
        .populate('recipient', MONGO_SELECT.USER.DEFAULT)
        .sort({ date: 1 });
    }
}
