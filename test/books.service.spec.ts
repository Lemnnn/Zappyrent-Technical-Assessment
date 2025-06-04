import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../src/books/books.service';
import { SupabaseService } from '../src/supabase/supabase.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    uploadImage: jest.fn(),
    createBook: jest.fn(),
    findBooksByUserId: jest.fn(),
    findBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = '1';
    const createBookDto = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      year: 2023,
    };

    it('should create a book without image', async () => {
      const bookData = {
        id: '1',
        ...createBookDto,
        user_id: userId,
        created_at: new Date().toISOString(),
      };

      mockSupabaseService.createBook.mockResolvedValue({
        data: bookData,
        error: null,
      });

      const result = await service.create(createBookDto, userId);

      expect(result).toEqual(bookData);
      expect(mockSupabaseService.createBook).toHaveBeenCalledWith({
        ...createBookDto,
        userId,
        coverImageUrl: undefined,
      });
    });

    it('should create a book with image', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      };
      const imageUrl = 'https://example.com/test.jpg';
      const bookData = {
        id: '1',
        ...createBookDto,
        user_id: userId,
        coverImageURL: imageUrl,
        created_at: new Date().toISOString(),
      };

      mockSupabaseService.uploadImage.mockResolvedValue({
        data: { publicUrl: imageUrl },
        error: null,
      });
      mockSupabaseService.createBook.mockResolvedValue({
        data: bookData,
        error: null,
      });

      const result = await service.create(
        createBookDto,
        userId,
        mockFile as Express.Multer.File,
      );

      expect(result).toEqual(bookData);
      expect(mockSupabaseService.uploadImage).toHaveBeenCalled();
      expect(mockSupabaseService.createBook).toHaveBeenCalledWith({
        ...createBookDto,
        userId,
        coverImageUrl: imageUrl,
      });
    });
  });

  describe('findAll', () => {
    const userId = '1';

    it('should return all books for user', async () => {
      const books = [
        {
          id: '1',
          title: 'Book 1',
          user_id: userId,
        },
        {
          id: '2',
          title: 'Book 2',
          user_id: userId,
        },
      ];

      mockSupabaseService.findBooksByUserId.mockResolvedValue({
        data: books,
        error: null,
      });

      const result = await service.findAll(userId);

      expect(result).toEqual(books);
      expect(mockSupabaseService.findBooksByUserId).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('findOne', () => {
    const userId = '1';
    const bookId = '1';

    it('should return a book if it belongs to the user', async () => {
      const book = {
        id: bookId,
        title: 'Book 1',
        user_id: userId,
      };

      mockSupabaseService.findBookById.mockResolvedValue({
        data: book,
        error: null,
      });

      const result = await service.findOne(bookId, userId);

      expect(result).toEqual(book);
      expect(mockSupabaseService.findBookById).toHaveBeenCalledWith(bookId);
    });

    it('should throw ForbiddenException if book belongs to another user', async () => {
      const book = {
        id: bookId,
        title: 'Book 1',
        user_id: 'another-user',
      };

      mockSupabaseService.findBookById.mockResolvedValue({
        data: book,
        error: null,
      });

      await expect(service.findOne(bookId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if book not found', async () => {
      mockSupabaseService.findBookById.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.findOne(bookId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
