import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultRegistration } from 'src/schemas/resultRegistration.schema';
import { CreateResultRegistrationDto } from './dtos/create-result-registration.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ResultRegistrationService {
    constructor(
        @InjectModel(ResultRegistration.name) private resultRegistrationModel: Model<ResultRegistration>,
        private readonly notificationService: NotificationService,
    ) { }


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

        // this.notificationService.createGeneralNotification({
        //     content: `Bạn đã đặt lịch hẹn thành công`,
        //     recipient: createResultRegistrationDto.user,
        // });

        return resultRegistration.save();
    }

    async deleteResultRegistration(id: string) {
        return this.resultRegistrationModel.findByIdAndDelete(id);
    }
}
