import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionDoctorDto } from './dtos/permission-doctor.dto';
import { GetDoctorHaveShiftDto } from './dtos/get-doctor-have-shift.dto';

@Controller('api/doctor')
@ApiTags('doctor')
@ApiBearerAuth()
export class DoctorController {
    constructor(private readonly doctorService: DoctorService){}

    @Post('/create')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    async createDoctor(@Body() createDoctorDto: CreateDoctorDto,
            @UploadedFile() file: Express.Multer.File) {
        if (file !== undefined) {
            createDoctorDto.avatar = file;
        }
        return this.doctorService.createDoctor(createDoctorDto);
        
    }


    @Get('/all')
    async getAllDoctors() {
        return this.doctorService.findAllDoctors();
    }

    @Get('/all/shift')
    async getAllDoctorsHaveShift() {
        return this.doctorService.findAllDoctorsHaveShift();
    }

    @Get('/all/filterShift')
    async getAllDoctorsHaveShiftFilter(@Query() getDoctorHaveShiftDto: GetDoctorHaveShiftDto) {
        return this.doctorService.findDoctorsHaveShift(getDoctorHaveShiftDto);
    }

    @Put('/update/permissionDoctor')
    @UseGuards(AuthGuard)
    async updateDoctorPermission(@Body() permissionDoctorDto: PermissionDoctorDto) {
        return this.doctorService.updateDoctorPermission(permissionDoctorDto);
    }
}
