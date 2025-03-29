import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultRegistration } from 'src/schemas/resultRegistration.schema';
import { CreateResultRegistrationDto } from './dtos/create-result-registration.dto';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/schemas/user.schema';
import { ShiftSegmentService } from 'src/shift-segment/shift-segment.service';
import { GetResultRegistrationByFilterDto } from './dtos/get-result-registration-by-filter.dto';
import { ShiftSegment } from 'src/schemas/shiftSegment.schema';

type ResultRegistrationWithShiftSegment = ResultRegistration & { shiftSegment: ShiftSegment }

@Injectable()
export class ResultRegistrationService {
    constructor(
        @InjectModel(ResultRegistration.name) private resultRegistrationModel: Model<ResultRegistration>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly shiftSegmentService: ShiftSegmentService,
        private readonly notificationService: NotificationService,
    ) { }

    async getResultRegistrationById(id: string) {
        return this.resultRegistrationModel.findById(id)
            .populate({
                path: 'shiftSegment',
                select: 'startTime endTime date'
            })
            .populate({
                path: 'recordPatient',
            }).populate({
                path: 'medExamService',
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
                path: 'shiftSegment',
                select: 'startTime endTime date'
            })
            .populate({
                path: 'recordPatient',
            })
            .populate({
                path: 'medExamService',
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

        resultRegistration.isPaid = true;

        const doctor = await this.userModel.findById(createResultRegistrationDto.doctor);

        const shiftSegment = await this.shiftSegmentService.updateCurrentRegistrations(createResultRegistrationDto.shiftSegment);

        if (!shiftSegment) {
            throw new Error('Shift segment is full');
        }
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

    async getResultRegistrationByFilter(filter: GetResultRegistrationByFilterDto) {
        const queryObject: any = {};
        if (filter.doctor)
            queryObject.doctor = filter.doctor;
        if (filter.status)
            queryObject.status = filter.status;
        
        const query = this.resultRegistrationModel.find(queryObject)
            .populate('shiftSegment')
            .populate('recordPatient')
            .populate('medExamService')
            .lean<ResultRegistrationWithShiftSegment[]>();

        return query.then((resultRegistrations) => {
            if (filter.startDate && filter.endDate) {
                return resultRegistrations.filter((resultRegistration) => {
                    const startDate = new Date(filter.startDate);
                    const endDate = new Date(filter.endDate);
                    const registrationDate = new Date(resultRegistration.shiftSegment.date);

                    return registrationDate >= startDate && registrationDate <= endDate;
                });
            }
            return resultRegistrations;
        });
    }
}
