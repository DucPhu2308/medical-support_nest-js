import { Body, Controller, Get, Post, Put, Query, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from 'src/schemas/user.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('/api/user')
@ApiTags('user')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/find')
    async getUsers(@Query('email') email: string) {
        return this.userService.findOneByEmailContains(email);
    }

    @Get('/search')
    @UseGuards(AuthGuard)
    async searchUsers(@Query('query') query: string, @Query('isDoctor') isDoctor: boolean, @Req() req) {
        return this.userService.findOneByEmailOrUsernameContains(query, isDoctor, req.user.sub);
    }

    @Get('/all')
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Get('/')
    async getUser(@Query('userId') userId: string) {
        return this.userService.findOneById(userId);
    }

    @Get('/followedByUser/')
    async getFollowedByUser(@Query('userId') userId: string) {
        return this.userService.findFollowedByUser(userId);
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

    @Put('/change-password')
    @UseGuards(AuthGuard)
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.userService.changePassword(changePasswordDto.newPassword, req.user.sub);
    }

}
