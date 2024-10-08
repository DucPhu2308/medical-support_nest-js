import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MONGO_SELECT } from 'src/common/constances';
import { User } from 'src/schemas/user.schema';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FollowUserDto } from './dtos/follow-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseService, UploadFolder } from 'src/firebase/firebase.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly firebaseService: FirebaseService,
    ) { }

    async findAll() {
        return this.userModel.find().select(MONGO_SELECT.USER.DEFAULT).populate('following', MONGO_SELECT.USER.DEFAULT);
    }

    async findOneByEmailContains(email: string) {
        return this.userModel
            .find({ email: { $regex: email, $options: 'i' } })
            .select(MONGO_SELECT.USER.DEFAULT);
    }

    async findOneById(userId: string) {
        return this.userModel
            .findById(userId)
            .select(MONGO_SELECT.USER.DEFAULT)
            .populate('following', MONGO_SELECT.USER.DEFAULT);
    }

    async updateProfile(userId: string, data: UpdateProfileDto) {
        const file = data.avatar;

        // Tìm user theo userId
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Nếu có file (avatar), upload lên Firebase và cập nhật avatar của user
        if (file) {
            const avatar = await this.firebaseService.uploadFile(file, UploadFolder.POST);
            user.avatar = avatar; // Cập nhật avatar mới cho user
        }

        // Cập nhật các thông tin khác từ DTO nếu cần
        Object.keys(data).forEach((key) => {
            if (key !== 'avatar' && data[key]) {
                user[key] = data[key]; // Cập nhật tất cả các field khác ngoài avatar
            }
        });
        await user.save();

        return user;
    }

    async followUser(FollowUserDto: FollowUserDto) {
        const userId = FollowUserDto.userId;
        const followId = new Types.ObjectId(FollowUserDto.followId);

        // Tìm người dùng để xác định xem đã follow chưa
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.following.includes(followId)) {
            // Nếu đã follow, bỏ theo dõi
            return this.userModel.updateOne(
                { _id: userId },
                { $pull: { following: followId } }
            );
        } else {
            // Nếu chưa follow, thêm vào danh sách theo dõi
            return this.userModel.updateOne(
                { _id: userId },
                { $addToSet: { following: followId } }
            );
        }
    }
}
