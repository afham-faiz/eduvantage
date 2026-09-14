import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches } from "class-validator";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class ListDealsQueryDto {
  @ApiPropertyOptional({
    description: "Only return featured deals.",
    example: true,
  })
  @IsOptional()
  // class-transformer's `@Type(() => Boolean)` coerces any non-empty
  // string (including "false") to `true` — this transform reads the raw
  // query string correctly instead.
  @Transform(({ value }) => (value === undefined ? undefined : value === "true"))
  featured?: boolean;

  @ApiPropertyOptional({
    description:
      "Institution slug. Returns deals open to every institution plus deals " +
      "explicitly targeting this one.",
    example: "chse-male",
  })
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, { message: "institution must be a valid slug" })
  institution?: string;
}
