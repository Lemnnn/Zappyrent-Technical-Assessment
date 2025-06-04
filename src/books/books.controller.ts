import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '@supabase/supabase-js';
import { FileInterceptor } from '@nestjs/platform-express';

interface AuthenticatedRequest {
  user: User;
}

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() image: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.booksService.create(createBookDto, userId, image);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.booksService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.booksService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.booksService.update(id, updateBookDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.booksService.remove(id, userId);
  }
}
