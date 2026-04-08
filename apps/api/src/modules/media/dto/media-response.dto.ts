import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaKind } from '@prisma/client';

export class MediaResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'https://media.cyprus-villages.com/villages/42/cover-uuid.jpg' })
  url!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Omodos village square' })
  alt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 1200 })
  width!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 800 })
  height!: number | null;

  @ApiProperty({ enum: MediaKind, example: MediaKind.COVER })
  kind!: MediaKind;

  @ApiPropertyOptional({ nullable: true, example: 42 })
  villageId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  festivalId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  festivalEditionId!: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/** Minimal shape embedded in village/festival detail responses. */
export class MediaBriefDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional({ nullable: true })
  alt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  width!: number | null;

  @ApiPropertyOptional({ nullable: true })
  height!: number | null;
}
