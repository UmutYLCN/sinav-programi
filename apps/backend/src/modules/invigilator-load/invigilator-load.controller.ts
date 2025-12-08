import { Controller, Get, Param, Query } from '@nestjs/common';
import { InvigilatorLoadService } from './invigilator-load.service';
import { InvigilatorLoadQueryDto } from './dto/invigilator-load-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Roles('YONETICI', 'BOLUM_SORUMLUSU')
@Controller('invigilator-load')
export class InvigilatorLoadController {
  constructor(
    private readonly invigilatorLoadService: InvigilatorLoadService,
  ) {}

  @Get()
  list(@Query() query: InvigilatorLoadQueryDto) {
    return this.invigilatorLoadService.listLoads(query);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Query() query: InvigilatorLoadQueryDto) {
    return this.invigilatorLoadService.detail(id, query);
  }
}
