import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RecordPatientService } from './record-patient.service';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { CreateRecordPatientDto } from './dtos/create-record-patient.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/record-patient')
@ApiTags('record-patient')
@ApiBasicAuth()
export class RecordPatientController {
    constructor(
        private readonly recordPatientService: RecordPatientService
    ) {}

    @Get("/all")
    async findAll() {
        return this.recordPatientService.findAll();
    }

    @Get("/by-user/:userId")
    async findById(@Param('userId') id: string) {
        return this.recordPatientService.findById(id);
    }


    @Post("/create")
    @UseGuards(AuthGuard)
    async createRecordPatient(@Body() createRecordPatientDto: CreateRecordPatientDto) {
        return this.recordPatientService.createRecordPatient(createRecordPatientDto);
    }

    @Put("/update/:recordPatientId")
    @UseGuards(AuthGuard)
    async updateRecordPatient(@Param('recordPatientId') recordPatientId: string, @Body() createRecordPatientDto: CreateRecordPatientDto) {
        return this.recordPatientService.updateRecordPatient(recordPatientId, createRecordPatientDto);
    }

    @Put("/update-using-by/:recordPatientId")
    @UseGuards(AuthGuard)
    async updateUsingBy(@Param('recordPatientId') recordPatientId: string, @Body('usingBy') usingBy: string) {
        return this.recordPatientService.updateUsingBy(recordPatientId, usingBy);
    }
    
    @Delete("/delete/:recordPatientId")
    @UseGuards(AuthGuard)
    async deleteRecordPatient(@Param('recordPatientId') recordPatientId: string) {
        return this.recordPatientService.deleteRecordPatient(recordPatientId);
    }

    @Get("/search")
    async searchRecordPatient(@Query('q') search: string) {
        return this.recordPatientService.searchRecordPatient(search);
    }
}
