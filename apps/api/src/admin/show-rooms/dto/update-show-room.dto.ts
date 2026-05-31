import { PartialType } from '@nestjs/mapped-types';
import { CreateShowRoomDto } from './create-show-room.dto';

export class UpdateShowRoomDto extends PartialType(CreateShowRoomDto) {}
