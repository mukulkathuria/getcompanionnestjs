import { Test, TestingModule } from '@nestjs/testing';
import { UserBookingController } from './userbooking.controller';
import { UserBookingsService } from './userbooking.service';
import { HttpException } from '@nestjs/common';
import { BookingDurationUnitEnum } from 'src/dto/bookings.dto';

describe('UserBookingController', () => {
  let controller: UserBookingController;
  let service: UserBookingsService;

  const mockUserBookingsService = {
    getAllBookingsForUser: jest.fn(),
    getpreviousBookingsForUser: jest.fn(),
    bookaCompanion: jest.fn(),
    checkBookedSlotsforCompanion: jest.fn(),
    cancelBooking: jest.fn(),
    getUserBookingDetails: jest.fn(),
    rateabookingservice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBookingController],
      providers: [
        {
          provide: UserBookingsService,
          useValue: mockUserBookingsService,
        },
      ],
    }).compile();

    controller = module.get<UserBookingController>(UserBookingController);
    service = module.get<UserBookingsService>(UserBookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUpcomingBookingController', () => {
    it('should return bookings data when successful', async () => {
      const mockData = { bookings: [] };
      mockUserBookingsService.getAllBookingsForUser.mockResolvedValue({ data: mockData });

      const result = await controller.getAllUpcomingBookingController('user123');
      
      expect(result).toEqual({ data: mockData });
      expect(service.getAllBookingsForUser).toHaveBeenCalledWith('user123');
    });

    it('should throw HttpException when error occurs', async () => {
      const mockError = { message: 'Error message', status: 400 };
      mockUserBookingsService.getAllBookingsForUser.mockResolvedValue({ error: mockError });

      await expect(controller.getAllUpcomingBookingController('user123'))
        .rejects
        .toThrow(new HttpException(mockError.message, mockError.status));
    });
  });

  describe('createBookingDetailsController', () => {
    const mockBookingData = {
      userId: 'user123',
      companionId: 'companion123',
      startTime: '13-04-2025 12:00',
      endTime: '13-04-2025 13:00',
      bookingdate: '13-04-2025 11:00',
      bookingduration: 2,
      bookingdurationUnit: BookingDurationUnitEnum.HOUR,
      bookinglocation: {
        city: 'Rohtak',
        lat: 17.098,
        lng: 78.098,
        state: 'Haryana',
        name: 'The Fatty Bao',
        userInput: 'The Fatty Bao',
        formattedaddress: 'Xyz testing',
        googleextra: null,
      },
      purpose: 'Meeting',
    };

    it('should create booking successfully', async () => {
      const mockResponse = { 
        success: true, 
        bookingid: 'booking123',
      };
      
      mockUserBookingsService.bookaCompanion.mockResolvedValue(mockResponse);

      const result = await controller.createBookingDetailsController(mockBookingData);

      expect(result).toEqual({
        success: true,
        bookingid: 'booking123',
        message: 'Booking created successfully.'
      });
      expect(service.bookaCompanion).toHaveBeenCalledWith(mockBookingData);
    });

    it('should throw HttpException when booking fails', async () => {
      const mockError = { message: 'Booking failed', status: 400 };
      mockUserBookingsService.bookaCompanion.mockResolvedValue({ success: false, error: mockError });

      await expect(controller.createBookingDetailsController(mockBookingData))
        .rejects
        .toThrow(new HttpException(mockError.message, mockError.status));
    });
  });

  describe('checkCompanionSlotController', () => {
    it('should return available slots when successful', async () => {
      const mockSlots = { availableSlots: [] };
      mockUserBookingsService.checkBookedSlotsforCompanion.mockResolvedValue({ data: mockSlots });

      const result = await controller.checkCompanionSlotController({ companionId: 'companion123' });

      expect(result).toEqual({ data: mockSlots });
      expect(service.checkBookedSlotsforCompanion).toHaveBeenCalledWith('companion123');
    });
  });
});
