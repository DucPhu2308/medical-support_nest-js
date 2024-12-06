import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorInfo } from 'src/schemas/doctor-info.schema';
import { Post } from 'src/schemas/post.schema';
import { Speciality } from 'src/schemas/speciality.schema';

@Injectable()
export class SpectialityService {
    constructor(
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>,
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(DoctorInfo.name) private doctorInfoModel: Model<DoctorInfo>
    ) { }

    async getAllSpeciality() {
        const specialities = await this.specialityModel.find();
        return specialities;
    }
    async createSpeciality(name: string) {
        // kiem tra xem speciality da ton tai chua
        const specialityExist = await this.specialityModel
            .findOne({ name });
        if (specialityExist) {
            return { error: 'Speciality already exists' };
        }
        const speciality = await this.specialityModel.create({
            name
        });
        return speciality;
    }

    async updateSpeciality(id: string, name: string) {
        return this.specialityModel.findByIdAndUpdate(id, { name });
    }

    async deleteSpeciality(id: string) {
        // kieemr tra xem co post nao chua speciality nay khong neu co thi khong xoa duoc
        const post = await this.postModel.findOne({ tags: id });

        const doctor = await this.doctorInfoModel.findOne({ specialities : id });

        if (post) {
            return { error: 'Speciality is in use' };
        }

        if(doctor) {
            return { error: 'Speciality is in use' };
        }

        await this.specialityModel.findByIdAndDelete(id);
        return { message: 'Delete speciality successfully' };
    }
}
