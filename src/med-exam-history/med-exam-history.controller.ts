import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { MedExamHistoryService } from './med-exam-history.service';
import { CreateMedExamHistoryDto } from './dtos/create-med-exam-history.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/med-exam-history')
export class MedExamHistoryController {
    constructor(private readonly medExamHistoryService: MedExamHistoryService) { }

    @Post('create')
    @UseGuards(AuthGuard)
    async createMedExamHistory(@Request() req, @Body() createMedExamHistoryDto: CreateMedExamHistoryDto) {
        createMedExamHistoryDto.doctor = req.user.sub;
        return this.medExamHistoryService.createMedExamHistory(createMedExamHistoryDto);
    }

    @Get('get-by-record-patient/:recordPatientId')
    async getMedExamHistoryByRecordPatientId(@Param('recordPatientId') recordPatientId: string) {
        return this.medExamHistoryService.getMedExamHistoryByRecordPatientId(recordPatientId);
    }
}
