import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConfigurationDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  storeAddress: string;

  @IsString()
  @IsOptional()
  storePhone: string;

  @IsEmail()
  @IsOptional()
  storeEmail: string;

  @IsString()
  @IsOptional()
  storeCurrency: string;

  @IsString()
  @IsOptional()
  storeTimezone: string;

  @IsString()
  @IsOptional()
  storeLogo: string;

  @IsString()
  @IsOptional()
  storeFavicon: string;

  @IsString()
  @IsOptional()
  storeLanguage: string;
}
