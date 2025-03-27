import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MedExamServiceService } from './med-exam-service.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMedExamServiceDto } from './dtos/create-medExamService.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/med-exam-service')
@ApiTags('med-exam-service')
export class MedExamServiceController {
    constructor(
        private readonly medExamServiceService: MedExamServiceService
    ) { }


    @Get('/all')
    async getAllMedExamServices() {
        return this.medExamServiceService.findAllMedExamServices();
    }

    @Post('/create')
    @UseGuards(AuthGuard)
    async createMedExamService(@Body() CreateMedExamServiceDto: CreateMedExamServiceDto) {
        return this.medExamServiceService.createMedExamService(CreateMedExamServiceDto);
    }

    @Put('/update/:id')
    @UseGuards(AuthGuard)
    async updateMedExamService(@Param("id")id: string, @Body() CreateMedExamServiceDto: CreateMedExamServiceDto) {
        return this.medExamServiceService.updateMedExamService(id, CreateMedExamServiceDto);
    }

    @Delete('/delete/:id')
    @UseGuards(AuthGuard)
    async deleteMedExamService(@Param("id") id: string) {
        return this.medExamServiceService.deleteMedExamService(id);
    }


}
