import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { RegisterResponseDto, LoginResponseDto } from './dto/auth-response.dto';

type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password } = registerDto;

    const result = (await this.supabaseService.findUserByEmail(
      email,
    )) as SupabaseResponse<User>;

    if (result.data) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createResult = (await this.supabaseService.createUser(
      email,
      hashedPassword,
    )) as SupabaseResponse<User>;

    if (createResult.error || !createResult.data) {
      throw new BadRequestException(
        `Failed to create user: ${createResult.error?.message || 'Unknown error'}`,
      );
    }

    const userData = createResult.data;

    return {
      message: 'User registered successfully',
      user: {
        id: userData.id,
        email: userData.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const result = (await this.supabaseService.findUserByEmail(
      email,
    )) as SupabaseResponse<User>;

    if (result.error || !result.data) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = result.data;

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: userData.id, email: userData.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userData.id,
        email: userData.email,
      },
    };
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const result = (await this.supabaseService.findUserById(
      id,
    )) as SupabaseResponse<User>;

    if (result.error || !result.data) {
      throw new UnauthorizedException('User not found');
    }

    const userData = result.data;

    return {
      id: userData.id,
      email: userData.email,
      created_at: userData.created_at,
    };
  }

  async validateUser(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    const user = await this.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
