import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeSlot } from 'src/schemas/timeSlot.schema';
import { CreateTimeSlotDto } from './dtos/create-time-slot.dto';

@Injectable()
export class TimeSlotService {
    constructor(
        @InjectModel(TimeSlot.name) private readonly timeSlotModel: Model<TimeSlot>
    ) { }

    async getTimeSlots() {
        return this.timeSlotModel.find();
    }

    async getTimeSlotsByDate(date: string) {
        return this.timeSlotModel.find({ date });
    }

    async createTimeSlot(createTimeSlotDto: CreateTimeSlotDto | CreateTimeSlotDto[]) {
        if (Array.isArray(createTimeSlotDto)) {
            const timeSlots = createTimeSlotDto;
            
            for (const slot of timeSlots) {
                await this.timeSlotModel.findOneAndUpdate(
                    { date: slot.date, startTime: slot.startTime, endTime: slot.endTime }, // Điều kiện trùng ngày, giờ bắt đầu, giờ kết thúc
                    slot,
                    { upsert: true, new: true } // Cập nhật nếu tồn tại, thêm mới nếu không tồn tại
                );
            }
    
            // Sau khi thêm hoặc cập nhật xong, trả về tất cả TimeSlot trong database
            return await this.timeSlotModel.find();
        }
    }

    async updateTimeSlot(id: string, createTimeSlotDto: CreateTimeSlotDto) {
        return this.timeSlotModel.findByIdAndUpdate(id, createTimeSlotDto, { new: true });
    }

    async deleteTimeSlot(id: string) {
        return this.timeSlotModel.findByIdAndDelete(id);
    }
}
