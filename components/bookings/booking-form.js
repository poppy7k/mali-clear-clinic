import { AppError, ErrorTypes, handleError } from '../../utils/ErrorHandler.js';
import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";
import { toastManager } from '../../scripts/utils/toast.js';

class BookingForm extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('booking-form-template');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));  // แทนที่การใช้ shadowRoot ด้วยการเพิ่มลงในตัว element หลัก
    }

    async connectedCallback() {
        try {
            this.getProductDetailsFromUrl();
            const user = await getUserSession();
            if (!user) {
                window.location.href = "/mali-clear-clinic/pages/login.html";
                return;
            }
            this.userId = user.user_id;
            const bookingForm = this.querySelector('#booking-form'); // ใช้ querySelector แทนการเข้าถึงใน shadowRoot
            bookingForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        } catch (error) {
            this.handleError(error);
        }
    }

    getProductDetailsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('product_id');
        const productName = urlParams.get('product_name');
        
        if (!this.productId) {
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่พบข้อมูลสินค้า');
            window.location.href = '/mali-clear-clinic/pages/service.html';
            return;
        }
        
        this.querySelector('#product-name').textContent = productName;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        try {
            if (!this.userId) {
                throw new AppError('กรุณาเข้าสู่ระบบก่อนทำการจอง', ErrorTypes.AUTH_ERROR);
            }

            const bookingDate = this.querySelector('#booking-date').value;
            const selectedDate = new Date(bookingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                throw new AppError('กรุณาเลือกวันที่ในอนาคต', ErrorTypes.VALIDATION_ERROR);
            }

            const response = await this.submitBooking(bookingDate);
            if (response.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'จองคิวสำเร็จ');
                setTimeout(() => {
                    window.location.href = '/mali-clear-clinic/pages/my-bookings.html';
                }, 2000);
            } else {
                throw new AppError(response.message || 'ไม่สามารถทำการจองได้', ErrorTypes.API_ERROR);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        let errorMessage = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
    
        if (error instanceof AppError) {
            errorMessage = error.message;
        } else if (error?.message && typeof error.message === "string") {
            errorMessage = error.message;
        } else {
            errorMessage = JSON.stringify(error); // แปลงเป็นข้อความถ้าค่าไม่ใช่ string
        }
    
        console.error("Toast Error:", errorMessage);
        toastManager.addToast("error", "ข้อผิดพลาด", errorMessage);
    }

    async submitBooking(bookingDate) {
        try {
            const response = await fetch('/mali-clear-clinic/api/booking/Booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.userId,
                    product_id: this.productId,
                    booking_date: bookingDate,
                }),
            });
            
            if (!response.ok) {
                throw new AppError('การส่งข้อมูลล้มเหลว', ErrorTypes.API_ERROR);
            }
            
            return await response.json();
        } catch (error) {
            throw new AppError('ไม่สามารถทำการจองได้', ErrorTypes.NETWORK_ERROR, error);
        }
    }
}

customElements.define('booking-form', BookingForm);
