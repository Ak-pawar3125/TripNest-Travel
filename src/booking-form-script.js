document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const paymentFields = document.querySelectorAll('.dynamic-payment-fields');
    const summaryModal = document.getElementById('summary-modal');
    const successModal = document.getElementById('success-modal');
    const resetBtn = document.getElementById('reset-btn');
    
    // --- 1. Dynamic Payment Fields Toggle ---
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = radio.value;
            
            // Hide all payment fields first
            paymentFields.forEach(field => field.classList.remove('visible'));
            
            // Show the selected one
            const targetField = document.getElementById(`fields-${selectedValue}`);
            if (targetField) {
                targetField.classList.add('visible');
            }
        });
    });

    // --- 2. Form Validation & Summary ---
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            showSummary();
        }
    });

    function validateForm() {
        // Basic required validation is handled by HTML5 'required' attribute
        // Additional custom validation for Phone and Email
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return false;
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid phone number.');
            return false;
        }

        if (!paymentMethod) {
            alert('Please select a payment method.');
            return false;
        }

        // Validate selected payment method fields
        const method = paymentMethod.value;
        if (method === 'card') {
            const cardNum = document.getElementById('card-num').value;
            if (cardNum.length < 12) {
                alert('Please enter a valid card number.');
                return false;
            }
        } else if (method === 'upi') {
            const upiId = document.getElementById('upi-id').value;
            if (!upiId.includes('@')) {
                alert('Please enter a valid UPI ID.');
                return false;
            }
        } else if (method === 'netbanking') {
            const bank = document.getElementById('bank-name').value;
            if (!bank) {
                alert('Please select your bank.');
                return false;
            }
        }

        return true;
    }

    function showSummary() {
        const summaryDetails = document.getElementById('summary-details');
        const formData = new FormData(bookingForm);
        
        // Custom labels for mapping IDs to names
        const labels = {
            'full-name': 'Name',
            'email': 'Email',
            'phone': 'Phone',
            'destination': 'Destination',
            'travel-date': 'Date',
            'travelers': 'Travelers',
            'package': 'Package',
            'payment': 'Payment Method'
        };

        let summaryHtml = '';
        
        // Add basic fields
        const fields = ['full-name', 'email', 'phone', 'destination', 'travel-date', 'travelers'];
        fields.forEach(id => {
            const val = document.getElementById(id).value;
            summaryHtml += `
                <div class="summary-item">
                    <span class="summary-label">${labels[id]}</span>
                    <span class="summary-value">${val}</span>
                </div>
            `;
        });

        const pkg = document.querySelector('input[name="package"]:checked').value;
        summaryHtml += `
            <div class="summary-item">
                <span class="summary-label">Package</span>
                <span class="summary-value">${pkg}</span>
            </div>
        `;

        const pay = document.querySelector('input[name="payment"]:checked').value;
        summaryHtml += `
            <div class="summary-item">
                <span class="summary-label">Payment</span>
                <span class="summary-value" style="text-transform: capitalize;">${pay}</span>
            </div>
        `;

        summaryDetails.innerHTML = summaryHtml;
        summaryModal.classList.add('visible');
    }

    // --- 3. Final Submission ---
    document.getElementById('confirm-booking').addEventListener('click', () => {
        const formData = getFormData();
        
        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('travel_bookings') || '[]');
        bookings.push({
            ...formData,
            timestamp: new Date().toISOString(),
            status: 'Confirmed'
        });
        localStorage.setItem('travel_bookings', JSON.stringify(bookings));
        
        // Show success
        summaryModal.classList.remove('visible');
        successModal.classList.add('visible');
    });

    function getFormData() {
        return {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            destination: document.getElementById('destination').value,
            date: document.getElementById('travel-date').value,
            travelers: document.getElementById('travelers').value,
            package: document.querySelector('input[name="package"]:checked').value,
            paymentMethod: document.querySelector('input[name="payment"]:checked').value
        };
    }

    // --- 4. Modals and Reset ---
    document.getElementById('cancel-summary').addEventListener('click', () => {
        summaryModal.classList.remove('visible');
    });

    document.getElementById('close-success').addEventListener('click', () => {
        successModal.classList.remove('visible');
        bookingForm.reset();
        paymentFields.forEach(field => field.classList.remove('visible'));
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all fields?')) {
            bookingForm.reset();
            paymentFields.forEach(field => field.classList.remove('visible'));
        }
    });

    // Close modals on outside click
    window.onclick = function(event) {
        if (event.target == summaryModal) {
            summaryModal.classList.remove('visible');
        }
        if (event.target == successModal) {
            successModal.classList.remove('visible');
        }
    }
});
