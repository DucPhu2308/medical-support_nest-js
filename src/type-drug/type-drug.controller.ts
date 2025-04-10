import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TypeDrugService } from './type-drug.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateTypeDrugDto } from './dtos/create-typeDrug.dto';

@Controller('api/type-drug')
@ApiTags('type-drug')
export class TypeDrugController {
    constructor(
        private readonly typeDrugService: TypeDrugService
    ) { } // Constructor is empty, but you can inject services if needed.

    @Get('all')
    async getAllTypeDrugs() {
        return this.typeDrugService.getAllTypeDrugs();
    }
    @Get(':id')
    async getTypeDrugById(@Param('id') id: string) {
        return this.typeDrugService.getTypeDrugById(id);
    }

    @Post('create')
    async createTypeDrug(@Body() typeDrugData: CreateTypeDrugDto) {
        return this.typeDrugService.createTypeDrug(typeDrugData);
    }

    @Put('update/:id')
    async updateTypeDrug(@Param('id') id: string, @Body() typeDrugData: CreateTypeDrugDto) {
        return this.typeDrugService.updateTypeDrug(id, typeDrugData);
    }

    @Delete('delete/:id')
    async deleteTypeDrug(@Param('id') id: string) {
        return this.typeDrugService.deleteTypeDrug(id);
    }

}
