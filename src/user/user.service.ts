import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MONGO_SELECT } from 'src/common/constances';
import { User } from 'src/schemas/user.schema';

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
}
