import { IsBoolean } from 'class-validator';

export default class {
  @IsBoolean()
  claimsConfirmed: boolean;
}
