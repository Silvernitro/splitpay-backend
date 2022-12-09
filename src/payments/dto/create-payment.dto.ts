import { IsUUID } from 'class-validator';

export default class {
  @IsUUID('all')
  claimId: string;
}
