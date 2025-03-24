import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultRegistration } from 'src/schemas/resultRegistration.schema';
import { CreateResultRegistrationDto } from './dtos/create-result-registration.dto';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class ResultRegistrationService {
    constructor(
        @InjectModel(ResultRegistration.name) private resultRegistrationModel: Model<ResultRegistration>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly notificationService: NotificationService,
    ) { }

    async getResultRegistrationById(id: string) {
        return this.resultRegistrationModel.findById(id)
            .populate({
                path: 'timeSlot',
                select: 'startTime endTime date'
            })
            .populate({
                path: 'recordPatient',
            })
            .populate({
                path: 'doctor',
                select: 'doctorInfo firstName lastName',
                populate: {
                    path: 'doctorInfo',
                    select: 'specialities',
                    populate: {
                        path: 'specialities',
                        select: 'name'
                    }
                }
            })
            .exec();
    }

    async getAllResultRegistration(userId: string) {
        return this.resultRegistrationModel.find({ user: userId })
            .populate({
                path: 'timeSlot',
                select: 'startTime endTime date'
            })
            .populate({
                path: 'recordPatient',
            })
            .populate({
                path: 'doctor',
                select: 'doctorInfo firstName lastName',
                populate: {
                    path: 'doctorInfo',
                    select: 'specialities',
                    populate: {
                        path: 'specialities',
                        select: 'name'
                    }
                }
            })
            .exec();
    }


    async createResultRegistration(createResultRegistrationDto: CreateResultRegistrationDto) {
        const resultRegistration = new this.resultRegistrationModel(createResultRegistrationDto);

        const doctor = await this.userModel.findById(createResultRegistrationDto.doctor);

        this.notificationService.createGeneralNotification({
            recipient: createResultRegistrationDto.user,
            content: `Bạn đã đặt lịch khám thành công với bác sĩ ${doctor.firstName} ${doctor.lastName}`,
            actionUrl: `/detail-appointment/${resultRegistration._id}`
        });

        return resultRegistration.save();
    }

    async deleteResultRegistration(id: string) {
        return this.resultRegistrationModel.findByIdAndDelete(id);
    }
}
