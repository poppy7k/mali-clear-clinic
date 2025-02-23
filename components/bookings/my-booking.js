import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";
import BookingService from '../../services/BookingService.js';
import { handleError } from '../../utils/ErrorHandler.js';
import { showToast } from '../../utils/Toast.js';

class MyBookings extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        try {
            const user = await getUserSession();
            if (!user) {
                window.location.href = "/mali-clear-clinic/pages/login.html";
                return;
            }

            this.userId = user.user_id;
            this.render();
            await this.loadBookings();
        } catch (error) {
            showToast('error', handleError(error, 'MyBookings'));
        }
    }

    async loadBookings() {
        try {
            const result = await BookingService.getBookingsByUserId(this.userId);
            const bookings = result.bookings;

            const bookingList = this.querySelector("#booking-list");
            bookingList.innerHTML = bookings.length > 0
                ? bookings.map(booking => `
                    <tr class="border-b border-gray-200 text-gray-700">
                        <td class="p-3">${booking.id}</td>
                        <td class="p-3">${booking.product_name}</td>
                        <td class="p-3">${new Date(booking.booking_date).toLocaleDateString('th-TH')}</td>
                        <td class="p-3">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                            }">
                                ${booking.status}
                            </span>
                        </td>
                    </tr>
                `).join("")
                : "<tr><td colspan='4' class='p-4 text-center'>ไม่พบข้อมูลการจอง</td></tr>";
        } catch (error) {
            showToast('error', handleError(error, 'MyBookings'));
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <h2 class="text-2xl font-bold mb-4">การจองของฉัน</h2>
                <div class="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead class="border-b border-gray-200">
                            <tr class="text-gray-800 font-semibold">
                                <th class="p-3 text-left">รหัสการจอง</th>
                                <th class="p-3 text-left">บริการ</th>
                                <th class="p-3 text-left">วันที่</th>
                                <th class="p-3 text-left">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="booking-list">
                            <tr><td colspan="4" class="p-4 text-center">กำลังโหลด...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define("my-bookings", MyBookings);
