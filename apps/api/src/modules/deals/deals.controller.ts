import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DealsService } from "./deals.service";
import { DealListResponseDto, DealResponseDto, ListDealsQueryDto } from "./dto";

@ApiTags("deals")
@Controller("deals")
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({
    summary: "List active deals",
    description:
      "Active deals from active merchants, within their start/end window. " +
      "Featured deals sort first, then newest.",
  })
  @ApiOkResponse({ type: DealListResponseDto })
  async listDeals(@Query() query: ListDealsQueryDto): Promise<DealListResponseDto> {
    const deals = await this.dealsService.listDeals({
      featured: query.featured,
      institutionSlug: query.institution,
    });
    return { deals };
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get a single active deal by slug" })
  @ApiOkResponse({ type: DealResponseDto })
  @ApiNotFoundResponse({ description: "No active deal matches that slug." })
  async getDeal(@Param("slug") slug: string): Promise<DealResponseDto> {
    return this.dealsService.getDealBySlug(slug);
  }
}
