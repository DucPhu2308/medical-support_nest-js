import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dtos/create-doctor.dto';

@Controller('api/doctor')
@ApiTags('doctor')
@ApiBearerAuth()
export class DoctorController {
    constructor(private readonly doctorService: DoctorService){}

    @Post()
    @UseGuards(AuthGuard)
    async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
        return this.doctorService.createDoctor(createDoctorDto);
        
    }
}
