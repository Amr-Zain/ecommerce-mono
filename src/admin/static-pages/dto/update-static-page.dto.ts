import { CreateStaticPageDto } from './create-static-page.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStaticPageDto extends PartialType(CreateStaticPageDto) {}
