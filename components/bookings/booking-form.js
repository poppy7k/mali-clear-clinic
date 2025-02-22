import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";

class BookingForm extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('booking-form-template');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));  // แทนที่การใช้ shadowRoot ด้วยการเพิ่มลงในตัว element หลัก
    }

    async connectedCallback() {
        this.getProductDetailsFromUrl();
        const user = await getUserSession();
        if (!user) {
            window.location.href = "/mali-clear-clinic/pages/login.html";
            return;
        }
        this.userId = user.user_id;
        const bookingForm = this.querySelector('#booking-form'); // ใช้ querySelector แทนการเข้าถึงใน shadowRoot
        bookingForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    getProductDetailsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('product_id');
        const productName = urlParams.get('product_name');
        
        if (!this.productId) {
            alert('ไม่พบข้อมูลสินค้า');
            window.location.href = '/mali-clear-clinic/pages/products.html';
            return;
        }
        
        this.querySelector('#product-name').textContent = productName;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const bookingDate = this.querySelector('#booking-date').value;
        
        if (!this.userId) {
            alert('กรุณาเข้าสู่ระบบก่อนทำการจอง');
            return;
        }

        // ตรวจสอบว่าวันที่จองเป็นวันในอนาคต
        const selectedDate = new Date(bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            alert('กรุณาเลือกวันที่ในอนาคต');
            return;
        }

        const response = await this.submitBooking(bookingDate);
        if (response.status === 'success') {
            this.showSuccessMessage();
        } else {
            this.showErrorMessage(response.message || 'เกิดข้อผิดพลาดในการจอง');
        }
    }

    async submitBooking(bookingDate) {
        try {
            const response = await fetch('/mali-clear-clinic/api/booking/Booking.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    product_id: this.productId, 
                    booking_date: bookingDate,
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error submitting booking:', error);
            return { status: 'error' };
        }
    }

    showSuccessMessage() {
        this.querySelector('#error-message').classList.add('hidden');
        this.querySelector('#success-message').classList.remove('hidden');
    }

    showErrorMessage(message = 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง') {
        const errorElement = this.querySelector('#error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        this.querySelector('#success-message').classList.add('hidden');
    }
}

customElements.define('booking-form', BookingForm);
