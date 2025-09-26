import { PartialType } from '@nestjs/swagger';
import { CreateUsersAllowedDto } from './create-users-allowed.dto';

export class UpdateUsersAllowedDto extends PartialType(CreateUsersAllowedDto) {}
