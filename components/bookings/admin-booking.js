import { getUserSession } from "/mali-clear-clinic/scripts/auth/userSession.js";

class AdminBooking extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        // เช็ค role ของผู้ใช้จาก session หรือ API
        const user = await getUserSession();
        if (user.role !== 'ADMIN') {
            window.location.href = "/mali-clear-clinic/index.html";
            return;
        }
        
        this.render();
        this.loadBookings();
    }

    async loadBookings() {
        try {
            const response = await fetch(`/mali-clear-clinic/api/Booking.php`);
            const bookings = await response.json();

            const bookingList = this.querySelector("#booking-list");
            bookingList.innerHTML = bookings.length > 0
                ? bookings.map(booking => `
                    <tr class="hover:bg-gray-100">
                        <td class="p-3">${booking.id}</td>
                        <td class="p-3">${booking.username}</td>
                        <td class="p-3">${booking.product_name}</td>
                        <td class="p-3">${booking.booking_date}</td>
                        <td class="p-3">
                            <select class="status-select border p-1" data-id="${booking.id}">
                                <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Confirmed" ${booking.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="Cancelled" ${booking.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td class="p-3">
                            <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${booking.id}">Delete</button>
                        </td>
                    </tr>
                `).join("")
                : "<tr><td colspan='6' class='p-4 text-center'>No bookings found.</td></tr>";

            this.addEventListeners();
        } catch (error) {
            console.error("Error loading bookings:", error);
        }
    }

    addEventListeners() {
        // อัปเดตสถานะการจอง
        this.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (event) => {
                const bookingId = event.target.dataset.id;
                const newStatus = event.target.value;
                await this.updateBookingStatus(bookingId, newStatus);
            });
        });

        // ลบการจอง
        this.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const bookingId = event.target.dataset.id;
                if (confirm("Are you sure you want to delete this booking?")) {
                    await this.deleteBooking(bookingId);
                }
            });
        });
    }

    async updateBookingStatus(bookingId, status) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/Booking.php`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId, status })
            });
            const result = await response.json();
            alert(result.message);
            this.loadBookings(); // โหลดใหม่หลังอัปเดต
        } catch (error) {
            console.error("Error updating booking status:", error);
        }
    }

    async deleteBooking(bookingId) {
        try {
            const response = await fetch(`/mali-clear-clinic/api/Booking.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: bookingId })
            });
            const result = await response.json();
            alert(result.message);
            this.loadBookings(); // โหลดใหม่หลังลบ
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    }

    render() {
        this.innerHTML = `
            <div class="container mx-auto p-6">
                <h2 class="text-2xl font-bold mb-4">Manage Bookings</h2>
                <div class="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-200 text-gray-700">
                                <th class="p-3 text-left">Booking ID</th>
                                <th class="p-3 text-left">User</th>
                                <th class="p-3 text-left">Product</th>
                                <th class="p-3 text-left">Date</th>
                                <th class="p-3 text-left">Status</th>
                                <th class="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="booking-list">
                            <tr><td colspan="6" class="p-4 text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

customElements.define("admin-booking", AdminBooking);
