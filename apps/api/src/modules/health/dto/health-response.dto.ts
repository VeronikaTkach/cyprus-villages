import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'API status' })
  status!: string;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Current server timestamp (ISO 8601)',
  })
  timestamp!: string;
}
