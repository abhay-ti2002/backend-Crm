import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
    @ApiProperty({ example: 'Bug in login' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ example: 'I cannot login with my account' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: 'IT' })
    @IsNotEmpty()
    @IsString()
    sector: string;
}
