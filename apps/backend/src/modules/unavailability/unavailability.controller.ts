import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UnavailabilityService } from './unavailability.service';
import { CreateUnavailabilityDto } from './dto/create-unavailability.dto';
import { UpdateUnavailabilityDto } from './dto/update-unavailability.dto';
import { UnavailabilityQueryDto } from './dto/unavailability-query.dto';
import { ImportUnavailabilityDto } from './dto/import-unavailability.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Roles('YONETICI', 'BOLUM_SORUMLUSU', 'OGRETIM_UYESI')
@Controller('unavailability')
export class UnavailabilityController {
  constructor(private readonly unavailabilityService: UnavailabilityService) {}

  @Post()
  create(@Body() createUnavailabilityDto: CreateUnavailabilityDto) {
    return this.unavailabilityService.create(createUnavailabilityDto);
  }

  @Get()
  findAll(@Query() query: UnavailabilityQueryDto) {
    return this.unavailabilityService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unavailabilityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnavailabilityDto: UpdateUnavailabilityDto,
  ) {
    return this.unavailabilityService.update(id, updateUnavailabilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unavailabilityService.remove(id);
  }

  @Post('import')
  import(@Body() dto: ImportUnavailabilityDto) {
    return this.unavailabilityService.import(dto);
  }

  @Post('bulk-delete')
  bulkDelete(@Body('ids') ids: string[]) {
    return this.unavailabilityService.bulkDelete(ids ?? []);
  }

  @Get('export/csv')
  async exportCsv(
    @Res() res: Response,
    @Query() query: UnavailabilityQueryDto,
  ) {
    const csv = await this.unavailabilityService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="musait-degil-kayitlari.csv"`,
    );
    res.send(csv);
  }
}
