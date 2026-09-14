import { ApiProperty } from "@nestjs/swagger";
import type { DiscountType } from "@eduvantage/contracts";
import { DealMerchantDto } from "./deal-merchant.dto";

const DISCOUNT_TYPES: DiscountType[] = ["percentage", "fixed_amount", "special_price", "other"];

export class DealResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "clay-studio-student-pottery-session" })
  slug!: string;

  @ApiProperty({ example: "Student Pottery Session" })
  title!: string;

  @ApiProperty({ nullable: true, example: "15% off a walk-in pottery wheel session." })
  description!: string | null;

  @ApiProperty({ nullable: true, example: "Valid with student ID. Weekdays only." })
  terms!: string | null;

  @ApiProperty({ enum: DISCOUNT_TYPES, example: "percentage" })
  discountType!: DiscountType;

  @ApiProperty({ nullable: true, example: 15 })
  discountValue!: number | null;

  @ApiProperty({ nullable: true, format: "date-time" })
  startsAt!: string | null;

  @ApiProperty({ nullable: true, format: "date-time" })
  endsAt!: string | null;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty({ type: DealMerchantDto })
  merchant!: DealMerchantDto;
}
