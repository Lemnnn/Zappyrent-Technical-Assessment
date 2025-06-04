import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { SupabaseService } from '../src/supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let supabaseService: SupabaseService;
  let jwtService: JwtService;

  const mockSupabaseService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const userData = {
        id: '1',
        email: registerDto.email,
        created_at: new Date().toISOString(),
      };

      mockSupabaseService.findUserByEmail.mockResolvedValue({
        data: null,
        error: null,
      });
      mockSupabaseService.createUser.mockResolvedValue({
        data: userData,
        error: null,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'User registered successfully',
        user: {
          id: userData.id,
          email: userData.email,
        },
      });
      expect(mockSupabaseService.findUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockSupabaseService.createUser).toHaveBeenCalledWith(
        registerDto.email,
        hashedPassword,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockSupabaseService.findUserByEmail.mockResolvedValue({
        data: { id: '1', email: registerDto.email },
        error: null,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const userData = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
      };
      const token = 'jwt-token';

      mockSupabaseService.findUserByEmail.mockResolvedValue({
        data: userData,
        error: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: token,
        user: {
          id: userData.id,
          email: userData.email,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockSupabaseService.findUserByEmail.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const userData = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
      };

      mockSupabaseService.findUserByEmail.mockResolvedValue({
        data: userData,
        error: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
