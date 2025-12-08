import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoomDto } from './create-room.dto';

export class ImportRoomsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  kayitlar: CreateRoomDto[];
}

