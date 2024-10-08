import { Body, Controller, Get, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from 'src/schemas/user.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('/api/user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/find')
    async getUsers(@Query('email') email: string) {
        return this.userService.findOneByEmailContains(email);
    }

    @Get('/all')
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Get('/')
    async getUser(@Query('userId') userId: string) {
        return this.userService.findOneById(userId);
    }

    @Put('/follow/')
    @UseGuards(AuthGuard)
    async followUser(@Request() req, @Query('userId') userId: string) {
        return this.userService.followUser({userId: userId, followId: req.user.sub});
    }

    @Put('/update-profile')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFile() file: Express.Multer.File) {
        
        if (file !== undefined) {
            updateProfileDto.avatar = file;
        }
        
        return this.userService.updateProfile(req.user.sub, updateProfileDto);
    }

}
