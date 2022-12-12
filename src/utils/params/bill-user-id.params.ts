import { PickType } from '@nestjs/mapped-types';
import { IsUUID, IsString } from 'class-validator';

export class BillAndUserIdParams {
  @IsUUID('all')
  billId: string;

  @IsString()
  userId: string;
}

export class BillIdParams extends PickType(BillAndUserIdParams, [
  'billId',
] as const) {}
