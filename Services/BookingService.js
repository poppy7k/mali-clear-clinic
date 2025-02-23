import ApiClient from './api/ApiClient.js';
import { AppError, ErrorTypes } from '../utils/ErrorHandler.js';

class BookingService {
    static async createBooking(bookingData) {
        try {
            if (!bookingData.user_id || !bookingData.product_id || !bookingData.full_name ||
                !bookingData.phone || !bookingData.address || !bookingData.booking_date) {
                throw new AppError(
                    'กรุณากรอกข้อมูลการจองให้ครบถ้วน',
                    ErrorTypes.VALIDATION_ERROR
                );
            }
    
            const response = await ApiClient.post('/booking/Booking.php', bookingData);
            
            if (!response || response.status !== 'success') {
                throw new AppError(
                    response?.message || 'ไม่สามารถสร้างการจองได้',
                    ErrorTypes.API_ERROR
                );
            }
    
            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'เกิดข้อผิดพลาดในการสร้างการจอง',
                ErrorTypes.NETWORK_ERROR,
                error
            );
        }
    }    

    static async getBookings() {
        try {
            const response = await ApiClient.get('/booking/Booking.php');
            
            if (!response) {
                throw new AppError(
                    'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                    ErrorTypes.NETWORK_ERROR
                );
            }

            if (response.status !== 'success') {
                throw new AppError(
                    response.message || 'ไม่สามารถดึงข้อมูลการจองได้',
                    ErrorTypes.API_ERROR
                );
            }

            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
                ErrorTypes.NETWORK_ERROR,
                error
            );
        }
    }

    static async deleteBooking(bookingId) {
        try {
            if (!bookingId) {
                throw new AppError(
                    'ไม่พบรหัสการจอง',
                    ErrorTypes.VALIDATION_ERROR
                );
            }

            const response = await ApiClient.delete('/booking/Booking.php', { id: bookingId });
            
            if (!response || response.status !== 'success') {
                throw new AppError(
                    response?.message || 'ไม่สามารถลบการจองได้',
                    ErrorTypes.API_ERROR
                );
            }

            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'เกิดข้อผิดพลาดในการลบการจอง',
                ErrorTypes.NETWORK_ERROR,
                error
            );
        }
    }

    static async updateBookingStatus(bookingId, status) {
        try {
            if (!bookingId || !status) {
                throw new AppError(
                    'กรุณาระบุรหัสการจองและสถานะ',
                    ErrorTypes.VALIDATION_ERROR
                );
            }

            const response = await ApiClient.put('/booking/Booking.php', { 
                id: bookingId, 
                status: status 
            });

            if (!response || response.status !== 'success') {
                throw new AppError(
                    response?.message || 'ไม่สามารถอัพเดทสถานะการจองได้',
                    ErrorTypes.API_ERROR
                );
            }

            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'เกิดข้อผิดพลาดในการอัพเดทสถานะการจอง',
                ErrorTypes.NETWORK_ERROR,
                error
            );
        }
    }

    static async getBookingsByUserId(userId) {
        try {
            if (!userId) {
                throw new AppError(
                    'กรุณาระบุรหัสผู้ใช้',
                    ErrorTypes.VALIDATION_ERROR
                );
            }

            const response = await ApiClient.get(`/booking/Booking.php?user_id=${userId}`);
            
            if (!response) {
                throw new AppError(
                    'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                    ErrorTypes.NETWORK_ERROR
                );
            }

            if (response.status !== 'success') {
                throw new AppError(
                    response.message || 'ไม่สามารถดึงข้อมูลการจองได้',
                    ErrorTypes.API_ERROR
                );
            }

            return response;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
                ErrorTypes.NETWORK_ERROR,
                error
            );
        }
    }
}

export default BookingService; 