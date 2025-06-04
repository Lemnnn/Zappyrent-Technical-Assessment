import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Multer } from 'multer';

@Injectable()
export class BooksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createBookDto: CreateBookDto,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<Book> {
    let coverImageURL: string | undefined = undefined;

    if (image) {
      const uploadResult = await this.supabaseService.uploadImage(
        image,
        `books/${Date.now()}-${image.originalname}`,
      );

      if (uploadResult.error) {
        throw new BadRequestException(
          `Image upload failed: ${uploadResult.error.message}`,
        );
      }

      coverImageURL = uploadResult.data?.publicUrl;
    }

    const result = await this.supabaseService.createBook({
      ...createBookDto,
      userId,
      coverImageURL,
    });

    if (result.error) {
      throw new BadRequestException(
        `Failed to create book: ${result.error.message}`,
      );
    }

    if (!result.data) {
      throw new BadRequestException('Failed to create book: No data returned');
    }

    return result.data;
  }

  async findAll(userId: string): Promise<Book[]> {
    const result = await this.supabaseService.findBooksByUserId(userId);

    if (result.error) {
      throw new BadRequestException(
        `Failed to fetch books: ${result.error.message}`,
      );
    }

    if (!result.data) {
      return [];
    }

    return result.data;
  }

  async findOne(id: string, userId: string): Promise<Book> {
    const result = await this.supabaseService.findBookById(id);

    if (result.error || !result.data) {
      throw new NotFoundException('Book not found');
    }

    if (result.data.user_id !== userId) {
      throw new ForbiddenException(
        'Access denied: This book belongs to another user',
      );
    }

    return result.data;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    userId: string,
  ): Promise<Book> {
    await this.findOne(id, userId);

    const result = await this.supabaseService.updateBook(id, updateBookDto);

    if (result.error) {
      throw new BadRequestException(
        `Failed to update book: ${result.error.message}`,
      );
    }

    if (!result.data) {
      throw new BadRequestException('Failed to update book: No data returned');
    }

    return result.data;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    const result = await this.supabaseService.deleteBook(id);

    if (result.error) {
      throw new BadRequestException(
        `Failed to delete book: ${result.error.message}`,
      );
    }
  }
}
