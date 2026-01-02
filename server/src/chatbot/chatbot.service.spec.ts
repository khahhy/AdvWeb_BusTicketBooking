import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let geminiService: GeminiService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: GeminiService,
          useValue: {
            parseUserIntent: jest.fn(),
            generateResponse: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            locations: {
              findMany: jest.fn(),
            },
            trips: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    geminiService = module.get<GeminiService>(GeminiService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should handle trip search intent', async () => {
      const mockIntent = {
        intent: 'search_trip' as const,
        entities: {
          origin: 'Hà Nội',
          destination: 'Sài Gòn',
          date: '2024-12-21',
        },
      };

      jest
        .spyOn(geminiService, 'parseUserIntent')
        .mockResolvedValue(mockIntent);
      jest.spyOn(prismaService.locations, 'findMany').mockResolvedValue([
        {
          id: '1',
          name: 'Hà Nội',
          city: 'Hà Nội',
          address: null,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Sài Gòn',
          city: 'Hồ Chí Minh',
          address: null,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      jest.spyOn(prismaService.trips, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(geminiService, 'generateResponse')
        .mockResolvedValue('Tôi tìm thấy 0 chuyến xe.');

      const result = await service.processMessage({
        message: 'Tìm xe từ Hà Nội đi Sài Gòn ngày mai',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('trip_results');
    });

    it('should handle booking intent', async () => {
      const mockIntent = {
        intent: 'booking' as const,
        entities: {},
      };

      jest
        .spyOn(geminiService, 'parseUserIntent')
        .mockResolvedValue(mockIntent);
      jest
        .spyOn(geminiService, 'generateResponse')
        .mockResolvedValue(
          'Tôi có thể giúp bạn đặt vé. Bạn cần tìm chuyến xe không?',
        );

      const result = await service.processMessage({
        message: 'Tôi muốn đặt vé',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('text');
    });

    it('should handle FAQ intent', async () => {
      const mockIntent = {
        intent: 'faq' as const,
        entities: { topic: 'cancellation' },
      };

      jest
        .spyOn(geminiService, 'parseUserIntent')
        .mockResolvedValue(mockIntent);
      jest
        .spyOn(geminiService, 'generateResponse')
        .mockResolvedValue(
          'Bạn có thể hủy vé trước 24h để được hoàn 80% giá vé.',
        );

      const result = await service.processMessage({
        message: 'Làm sao để hủy vé?',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('faq_answer');
    });

    it('should handle general intent', async () => {
      const mockIntent = {
        intent: 'general' as const,
        entities: {},
      };

      jest
        .spyOn(geminiService, 'parseUserIntent')
        .mockResolvedValue(mockIntent);
      jest
        .spyOn(geminiService, 'generateResponse')
        .mockResolvedValue('Xin chào! Tôi có thể giúp bạn đặt vé xe khách.');

      const result = await service.processMessage({
        message: 'Xin chào',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('text');
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(geminiService, 'parseUserIntent')
        .mockRejectedValue(new Error('API Error'));

      const result = await service.processMessage({
        message: 'Test message',
      });

      expect(result).toBeDefined();
      expect(result.message).toContain('sự cố kỹ thuật');
    });
  });

  describe('getTripDetails', () => {
    it('should return trip details', async () => {
      const mockTrip = {
        id: '1',
        routeId: '1',
        busId: '1',
        departureDate: new Date(),
        arrivalDate: new Date(),
        status: 'AVAILABLE',
        basePrice: 100000,
        route: {
          id: '1',
          name: 'Hà Nội - Sài Gòn',
          originId: '1',
          destinationId: '2',
          origin: {
            id: '1',
            name: 'Hà Nội',
            province: 'Hà Nội',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          destination: {
            id: '2',
            name: 'Sài Gòn',
            province: 'Hồ Chí Minh',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        bus: {
          id: '1',
          busTypeId: '1',
          licensePlate: '29A-12345',
          busType: {
            id: '1',
            name: 'Giường nằm',
            seatCount: 40,
          },
        },
        bookings: [],
      };

      jest
        .spyOn(prismaService.trips, 'findUnique')
        .mockResolvedValue(mockTrip as any);

      const result = await service.getTripDetails('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });
  });
});
