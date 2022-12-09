import { IsString, IsNumber, Min } from 'class-validator';

export default class {
  @IsString()
  itemName: string;

  @IsNumber()
  @Min(0)
  price: number;
}
