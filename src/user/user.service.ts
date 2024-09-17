import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MONGO_SELECT } from 'src/common/constances';
import { User } from 'src/schemas/user.schema';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async findOneByEmailContains(email: string) {
        return this.userModel
            .find({ email: { $regex: email, $options: 'i' } })
            .select(MONGO_SELECT.USER.DEFAULT);
    }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        return this.userModel.updateOne({ _id: userId }, data);
    }
}
