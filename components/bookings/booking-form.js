import { AppError, ErrorTypes, handleError } from '../../utils/ErrorHandler.js';
import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";
import { toastManager } from '../../scripts/utils/toast.js';
import BookingService from '../../Services/BookingService.js';

class BookingForm extends HTMLElement {
    constructor() {
        super();
        this.productId = null;
        this.productName = "";
        this.userId = null;
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

            this.renderForm(); // ✅ Render UI
            this.setupDateRestrictions();
            this.generateTimeOptions();

            this.querySelector('.booking-btn').addEventListener('click', (event) => {
                this.handleFormSubmit(event);
            });

        } catch (error) {
            this.handleError(error);
        }
    }

    getProductDetailsFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('product_id');
        this.productName = urlParams.get('product_name') || "ไม่ระบุ";
    
        console.log("✅ URL Params:", window.location.search);
        console.log("📌 product_id:", this.productId);
        console.log("📌 product_name:", this.productName);
    
        if (!this.productId) {
            toastManager.addToast('error', 'ข้อผิดพลาด', 'ไม่พบข้อมูลสินค้า');
            window.location.href = '/mali-clear-clinic/pages/service.html';
            return;
        }
    }

    setupDateRestrictions() {
        const bookingDate = this.querySelector('#booking-date');
        const today = new Date().toISOString().split("T")[0];
        bookingDate.setAttribute("min", today);

        bookingDate.addEventListener("change", () => {
            this.generateTimeOptions();
        });
    }

    generateTimeOptions() {
        const bookingTime = this.querySelector('#booking-time');
        bookingTime.innerHTML = `<option value="">เลือกเวลา</option>`;

        const startHour = 9;
        const endHour = 18;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of ["00", "30"]) {
                const timeValue = `${String(hour).padStart(2, "0")}:${minute}`;
                const option = document.createElement("option");
                option.value = timeValue;
                option.textContent = timeValue;
                bookingTime.appendChild(option);
            }
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault(); // ❌ ป้องกัน Form โหลดซ้ำ
        console.log("📌 กำลังส่งฟอร์ม...");
        
        try {
            if (!this.userId) {
                throw new AppError('กรุณาเข้าสู่ระบบก่อนทำการจอง', ErrorTypes.AUTH_ERROR);
            }
    
            const fullName = this.querySelector('#full-name')?.querySelector('input')?.value;
            const phone = this.querySelector('#phone')?.querySelector('input')?.value;
            const address = this.querySelector('#address')?.querySelector('textarea, input')?.value;
            const bookingDate = this.querySelector('#booking-date')?.querySelector('input')?.value;
            const bookingTime = this.querySelector('#booking-time').value;

            console.log("📌 Full Name:", fullName);
            console.log("📌 Phone:", phone);
            console.log("📌 Address:", address);
            console.log("📌 Booking Date:", bookingDate);
            console.log("📌 Booking Time:", bookingTime);

    
            if (!fullName || !phone || !address || !bookingDate || !bookingTime) {
                throw new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', ErrorTypes.VALIDATION_ERROR);
            }
    
            console.log("📌 Booking Data:", {
                user_id: this.userId,
                product_id: this.productId,
                full_name: fullName,
                phone: phone,
                address: address,
                booking_date: `${bookingDate} ${bookingTime}:00`,
            });
    
            const response = await BookingService.createBooking({
                user_id: this.userId,
                product_id: this.productId,
                full_name: fullName,
                phone: phone,
                address: address,
                booking_date: `${bookingDate} ${bookingTime}:00`,
            });
    
            if (response.status === 'success') {
                toastManager.addToast('success', 'สำเร็จ', 'จองคิวสำเร็จ');
                setTimeout(() => {
                    window.location.href = '/mali-clear-clinic/pages/my-booking.html';
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
            errorMessage = JSON.stringify(error);
        }

        console.error("Toast Error:", errorMessage);
        toastManager.addToast("danger", "ข้อผิดพลาด", errorMessage);
    }

    renderForm() {
        this.innerHTML = `
            <div class="container mx-auto py-16">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">จองบริการของเรา</h2>
                <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h3 class="text-xl font-semibold text-gray-700 mb-4">จองบริการสำหรับ: <span>${this.productName}</span></h3>
                    <form id="booking-form">
                        <input type="hidden" name="product_id" value="${this.productId}">
                        <input type="hidden" name="product_name" value="${this.productName}">
                        <div class="mb-4">
                            <label for="full-name" class="block text-gray-700">ชื่อ-นามสกุล</label>
                            <form-input type="text" id="full-name" name="full-name" placeholder="กรอกชื่อ-นามสกุลของคุณ" required></form-input>
                        </div>
                        <div class="mb-4">
                            <label for="phone" class="block text-gray-700">เบอร์โทรศัพท์</label>
                            <form-input type="tel" id="phone" name="phone" placeholder="กรอกเบอร์โทรศัพท์" required></form-input>
                        </div>
                        <div class="mb-4">
                            <label for="address" class="block text-gray-700">ที่อยู่</label>
                            <form-input type="textarea" id="address" name="address" placeholder="กรอกที่อยู่ของคุณ" required></form-input>
                        </div>
                        <div class="mb-4">
                            <label for="booking-date" class="block text-gray-700">เลือกวันที่</label>
                            <form-input type="date" id="booking-date" name="booking-date" required></form-input>
                        </div>
                        <div class="mb-4">
                            <label for="booking-time" class="block text-gray-700">เลือกเวลา</label>
                            <select id="booking-time" name="booking-time" class="w-full p-2 mt-2 border border-gray-300 rounded" required>
                                <option value="">เลือกเวลา</option>
                            </select>
                        </div>
                        <div class="">
                            <custom-button
                                text="ยืนยันการจอง"
                                color="white"
                                bgColor="green-600"
                                hoverBg="green-500"
                                hoverText="white"
                                class="w-full text-lg booking-btn"
                            ></custom-button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}

customElements.define('booking-form', BookingForm);
