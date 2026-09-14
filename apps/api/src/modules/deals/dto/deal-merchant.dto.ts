import { ApiProperty } from "@nestjs/swagger";

export class DealMerchantDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "Clay Studio" })
  name!: string;

  @ApiProperty({ example: "clay-studio" })
  slug!: string;

  @ApiProperty({ nullable: true, example: null })
  logoUrl!: string | null;
}
