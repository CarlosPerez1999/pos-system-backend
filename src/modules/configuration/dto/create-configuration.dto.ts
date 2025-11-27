import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConfigurationDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  storeAddress: string;

  @IsString()
  @IsNotEmpty()
  storePhone: string;

  @IsEmail()
  @IsNotEmpty()
  storeEmail: string;

  @IsString()
  @IsNotEmpty()
  storeCurrency: string;

  @IsString()
  @IsNotEmpty()
  storeTimezone: string;

  @IsString()
  @IsOptional()
  storeLogo: string;

  @IsString()
  @IsOptional()
  storeFavicon: string;

  @IsString()
  @IsNotEmpty()
  storeLanguage: string;
}
