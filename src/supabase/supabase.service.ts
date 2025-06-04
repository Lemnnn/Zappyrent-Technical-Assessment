// src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateBookDto } from 'src/books/dto/create-book.dto';
import { UpdateBookDto } from 'src/books/dto/update-book.dto';
import { Book } from 'src/books/entities/book.entity';

export type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadImage(
    file: Express.Multer.File,
    path: string,
  ): Promise<SupabaseResponse<{ publicUrl: string }>> {
    const { data, error } = await this.supabase.storage
      .from('books')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      return { data: null, error };
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('books')
      .getPublicUrl(data?.path || '');

    return {
      data: { publicUrl: publicUrlData.publicUrl },
      error: null,
    };
  }

  async createUser(email: string, hashedPassword: string) {
    return await this.supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
  }

  async findUserByEmail(email: string) {
    return await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  }

  async findUserById(id: string) {
    return await this.supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', id)
      .single();
  }

  async createBook(
    bookData: CreateBookDto & { userId: string; coverImageURL?: string },
  ): Promise<SupabaseResponse<Book>> {
    return await this.supabase
      .from('books')
      .insert([
        {
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          year: bookData.year,
          coverImageURL: bookData.coverImageURL,
          user_id: bookData.userId,
        },
      ])
      .select()
      .single();
  }

  async findBooksByUserId(userId: string): Promise<SupabaseResponse<Book[]>> {
    return await this.supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async findBookById(id: string): Promise<SupabaseResponse<Book>> {
    return await this.supabase.from('books').select('*').eq('id', id).single();
  }

  async updateBook(
    id: string,
    updateData: UpdateBookDto,
  ): Promise<SupabaseResponse<Book>> {
    return await this.supabase
      .from('books')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteBook(id: string): Promise<SupabaseResponse<null>> {
    return await this.supabase.from('books').delete().eq('id', id);
  }
}
