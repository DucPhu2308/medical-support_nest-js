import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speciality } from 'src/schemas/speciality.schema';

@Injectable()
export class SpectialityService {
    constructor(
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>
    ) { }

    async getAllSpeciality() {
        const specialities = await this.specialityModel.find();
        return specialities;
    }
    async createSpeciality(name: string) {
        const speciality = await this.specialityModel.create({
            name
        });
        return speciality;
    }

    async updateSpeciality(id: string, name: string) {
        return this.specialityModel.findByIdAndUpdate(id, { name });
    }

    async deleteSpeciality(id: string) {
        return this.specialityModel.findByIdAndDelete(id);
    }
}
