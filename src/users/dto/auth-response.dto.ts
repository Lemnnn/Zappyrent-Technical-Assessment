import { ApiProperty } from '@nestjs/swagger';
import { IAuthResponse } from '../interfaces/auth-response.interface';

class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}

export class RegisterResponseDto implements IAuthResponse {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: UserDto })
  user: {
    id: string;
    email: string;
  };
}

export class LoginResponseDto implements IAuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserDto })
  user: {
    id: string;
    email: string;
  };
}
