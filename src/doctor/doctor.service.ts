import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DoctorInfo } from "src/schemas/doctor-info.schema";
import { User } from "src/schemas/user.schema";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { create } from "domain";
import * as bcrypt from 'bcrypt';


export class DoctorService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(DoctorInfo.name) private doctorModel: Model<DoctorInfo>
    ) { }

    async createDoctor(createDoctorDto: CreateDoctorDto) {
        const currentDoctor = await this.userModel.findOne({ email: createDoctorDto.email });
        if (currentDoctor) {
            throw new Error('Doctor already exists');
        }

        const doctorInfo = await this.doctorModel.create({
            phone: createDoctorDto.phone,
            specialty: createDoctorDto.specialty
        });

        const newDoctor = await this.userModel.create({
            email: createDoctorDto.email,
            dob: createDoctorDto.dob,
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            doctorInfo: doctorInfo._id,
            password: await bcrypt.hash(this.autoCreatePassword(), 10)

        })

        return newDoctor;
    }

    autoCreatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    }

}