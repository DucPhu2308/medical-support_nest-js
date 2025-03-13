import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift } from 'src/schemas/shift.schema';
import { CreateShiftDto } from './dtos/create-shift.dto';

@Injectable()
export class ShiftService {
    constructor(
        @InjectModel(Shift.name) private readonly shiftModel: Model<Shift>
    ) {}


    async findAll() {
        return this.shiftModel.find();
    }

    async createShift( createShiftDto: CreateShiftDto) {
        return this.shiftModel.create(createShiftDto);
    }

    async updateShift(shiftId: string, createShiftDto: CreateShiftDto) {
        return this.shiftModel.findByIdAndUpdate(shiftId, createShiftDto);
    }

    async deleteShift(shiftId: string) {    
        return this.shiftModel.findByIdAndDelete(shiftId);
    }
}

