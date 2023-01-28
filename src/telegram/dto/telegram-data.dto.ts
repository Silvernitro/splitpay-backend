import { IsString } from 'class-validator';

export default class {
  @IsString()
  initData: string;
}
