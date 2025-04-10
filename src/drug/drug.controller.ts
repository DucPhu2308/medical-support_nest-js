import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DrugService } from './drug.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateDrugDto } from './dtos/create-drug.dto';

@Controller('api/drug')
@ApiTags('Drug')
export class DrugController {
    constructor(
        private readonly DrugService: DrugService
    ) { }


    @Get('all')
    async getAllDrugs() {
        return this.DrugService.getAllDrugs();
    }

    @Get(':id')
    async getDrugById(@Param('id') id: string) {
        return this.DrugService.getDrugById(id);
    }

    @Post('create')
    @UseGuards(AuthGuard)
    async createDrug(@Body()DrugData: CreateDrugDto) {
        console.log(DrugData);
        return this.DrugService.createDrug(DrugData);
    }

    @Put('update/:id')
    @UseGuards(AuthGuard)
    async updateDrug(@Param('id') id: string, @Body() DrugData: CreateDrugDto) {
        return this.DrugService.updateDrug(id, DrugData);
    }

    @Delete('delete/:id')
    @UseGuards(AuthGuard)
    async deleteDrug(@Param('id') id: string) {
        return this.DrugService.deleteDrug(id);
    }
}
