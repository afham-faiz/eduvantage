import { ApiProperty } from "@nestjs/swagger";
import { DealResponseDto } from "./deal-response.dto";

export class DealListResponseDto {
  @ApiProperty({ type: [DealResponseDto] })
  deals!: DealResponseDto[];
}
