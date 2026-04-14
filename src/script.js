document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH UI STATE ---
    const navAuthContainer = document.getElementById('nav-auth-container');
    const navUserContainer = document.getElementById('nav-user-container');
    const mobileAuthContainer = document.getElementById('mobile-auth-container');
    const mobileUserContainer = document.getElementById('mobile-user-container');
    const navLogoutBtn = document.getElementById('nav-logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    async function checkAuthState() {
        try {
            const response = await fetch('/api/auth/user');
            const data = await response.json();
            
            if (data.success) {
                // Logged In
                if(navAuthContainer) navAuthContainer.classList.add('hidden');
                if(navUserContainer) navUserContainer.classList.remove('hidden');
                if(mobileAuthContainer) mobileAuthContainer.classList.add('hidden');
                if(mobileUserContainer) mobileUserContainer.classList.remove('hidden');
                
                window.currentUser = data.user;
                console.log('User logged in:', data.user.fullName);
            } else {
                // Logged Out
                if(navAuthContainer) navAuthContainer.classList.remove('hidden');
                if(navUserContainer) navUserContainer.classList.add('hidden');
                if(mobileAuthContainer) mobileAuthContainer.classList.remove('hidden');
                if(mobileUserContainer) mobileUserContainer.classList.add('hidden');
                window.currentUser = null;
            }
        } catch (err) {
            console.error('Auth check failed');
        }
    }

    checkAuthState();

    // --- Logout Handling ---
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
    };

    if(navLogoutBtn) navLogoutBtn.addEventListener('click', handleLogout);
    if(mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    const mobileLoginBtn = document.getElementById('mobile-nav-login-btn');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const navLoginBtn = document.getElementById('nav-login-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close menu when clicking any link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // Trigger Auth Modal
    const openAuth = () => {
        if (mobileMenu) mobileMenu.classList.add('hidden');
        if(authModal) {
            authModal.classList.remove('hidden-custom');
            authModal.classList.add('visible-custom');
            if (tabLogin) tabLogin.click(); // Default to login tab
        }
    };

    if(navLoginBtn) navLoginBtn.addEventListener('click', openAuth);
    if(mobileLoginBtn) mobileLoginBtn.addEventListener('click', openAuth);

    if(closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            authModal.classList.remove('visible-custom');
            authModal.classList.add('hidden-custom');
        });
    }

    // Modal click-outside logic
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthBtn.click();
        });
    }

    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (data.success) {
                    alert(`Welcome back, ${data.user.fullName}!`);
                    window.location.href = 'my-bookings.html'; // Redirect to User Profile
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Login failed');
            }
        });
    }

    if(formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const elName = document.getElementById('name-signup');
            const elPhone = document.getElementById('phone-signup');
            const elEmail = document.getElementById('email-signup');
            const elPass = document.getElementById('password-signup');

            if (!elName || !elPhone || !elEmail || !elPass) {
                console.error('SIGNUP FORM ERROR: Some inputs were not found in the DOM.');
                alert('Fatal Error: Form elements not found. Please refresh the page.');
                return;
            }

            const fullName = elName.value;
            const phone = elPhone.value;
            const email = elEmail.value;
            const password = elPass.value;

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, phone, email, password })
                });
                
                console.log('Signup Response Status:', response.status);
                const data = await response.json();
                
                if (data.success) {
                    alert(`Account created successfully! Please Log In.`);
                    if (tabLogin) tabLogin.click(); // Redirect to Log In
                } else {
                    console.warn('Signup Failed Server Message:', data.message);
                    alert(data.message || 'Signup failed');
                }
            } catch (err) {
                console.error('CLIENT SIGNUP ERROR:', err);
                alert('Signup failed: Connection error. Please ensure the server is running at http://localhost:8080');
            }
        });
    }


    // --- Destination Filtering Logic (Original preserved) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const destinationCards = document.querySelectorAll('.destination-card');
    const searchInput = document.getElementById('destination-search');
    let visibleCount = 6;
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');

    function applyFilters(resetCount = false) {
        if (resetCount) visibleCount = 6;
        let activeRegion = 'all';
        filterButtons.forEach(btn => { if (btn.classList.contains('active')) activeRegion = btn.getAttribute('data-region'); });
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        let matchIndex = 0;
        let totalMatches = 0;

        destinationCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const matchesRegion = (activeRegion === 'all' || card.getAttribute('data-region') === activeRegion);
            const matchesSearch = title.includes(query) || desc.includes(query);

            if (matchesRegion && matchesSearch) {
                totalMatches++;
                if (matchIndex < visibleCount) {
                    card.style.display = 'block';
                    matchIndex++;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });

        if (loadMoreContainer) {
            loadMoreContainer.style.display = totalMatches > visibleCount ? 'flex' : 'none';
        }
    }

    filterButtons.forEach(button => button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        applyFilters(true);
    }));

    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += 6; applyFilters(false); });
    applyFilters(true);

    if (searchInput) searchInput.addEventListener('input', () => applyFilters(true));


    // --- Chatbot Logic (Original preserved) ---
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (chatToggle) chatToggle.addEventListener('click', () => {
        chatWidget.classList.remove('hidden-custom');
        chatWidget.classList.add('visible-custom');
        chatToggle.style.display = 'none';
    });

    if (closeChat) closeChat.addEventListener('click', () => {
        chatWidget.classList.remove('visible-custom');
        chatWidget.classList.add('hidden-custom');
        chatToggle.style.display = 'flex';
    });

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('mb-4', 'max-w-[80%]', sender === 'user' ? 'ml-auto' : 'mr-auto');
        messageDiv.innerHTML = `<div class="${sender === 'user' ? 'bg-blue-600 text-white rounded-t-xl rounded-bl-xl' : 'bg-gray-100 text-gray-800 rounded-t-xl rounded-br-xl'} p-3 shadow-md text-sm">${text}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            appendMessage('user', message);
            chatInput.value = '';
            setTimeout(() => appendMessage('bot', "I'm a demo assistant! For real queries, please email support@tripnest.com"), 600);
        }
    });


    // --- Booking Modal Logic ---
    const bookingModal = document.getElementById('booking-modal');
    const closeBookingBtn = document.getElementById('close-booking');
    const destInput = document.getElementById('dest-input');
    const formBooking = document.getElementById('form-booking');
    const cardBookBtns = document.querySelectorAll('.destination-card button');

    function openBookingModal(destinationName = '') {
        if (!window.currentUser) {
            alert('Please login to book a package.');
            document.getElementById('nav-login-btn').click();
            return;
        }

        if(destInput) destInput.value = destinationName;
        // Reset staggered form
        document.getElementById('payment-options-wrapper').classList.add('hidden-payment');
        document.getElementById('payment-toggle-container').style.display = 'block';

        bookingModal.classList.remove('hidden-custom');
        bookingModal.classList.add('visible-custom');
    }

    cardBookBtns.forEach(btn => btn.addEventListener('click', (e) => {
        const card = e.target.closest('.destination-card');
        const destName = card ? card.querySelector('h4').textContent : '';
        openBookingModal(destName);
    }));

    if(closeBookingBtn) closeBookingBtn.addEventListener('click', () => {
        bookingModal.classList.remove('visible-custom');
        bookingModal.classList.add('hidden-custom');
    });


    // --- Payment Logic & Fake Popup ---
    const showPaymentBtn = document.getElementById('show-payment-btn');
    if (showPaymentBtn) showPaymentBtn.addEventListener('click', () => {
        document.getElementById('payment-options-wrapper').classList.remove('hidden-payment');
        document.getElementById('payment-toggle-container').style.display = 'none';
        
        // Initial setup for payment sections: hide all and show the one for the checked radio
        const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
        if (selectedRadio) {
            updatePaymentSections(selectedRadio.value);
        }
    });

    // --- Dynamic Payment Method Toggling ---
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    
    function updatePaymentSections(method) {
        const sections = document.querySelectorAll('.payment-detail-section');
        sections.forEach(s => s.classList.add('hidden-payment'));
        
        const target = document.getElementById(`${method}-details-section`);
        if (target) {
            target.classList.remove('hidden-payment');
        }
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updatePaymentSections(e.target.value);
        });
    });

    if (formBooking) {
        formBooking.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if payment section revealed
            if (document.getElementById('payment-options-wrapper').classList.contains('hidden-payment')) {
                showPaymentBtn.click();
                return;
            }

            const destination = destInput.value;
            const transactionId = 'TXN_DUMMY_' + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Prepare Booking Data BEFORE clearing UI
            const bookingData = {
                travelerName: document.getElementById('name-booking').value + ' ' + document.getElementById('lastname-booking').value,
                email: document.getElementById('email-booking').value,
                phone: document.getElementById('phone-booking').value,
                destination: destination,
                travelDate: document.getElementById('travel-date').value,
                returnDate: document.getElementById('return-date').value,
                travelersCount: parseInt(document.getElementById('travelers-count').value),
                amount: 499 * parseInt(document.getElementById('travelers-count').value) // Dummy price
            };

            const modalInner = formBooking.closest('.p-6');

            // Show Loading State
            modalInner.innerHTML = `
                <div class="text-center py-20">
                    <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 class="text-xl font-bold text-slate-50 mb-2">Processing Payment...</h3>
                    <p class="text-slate-400">Please do not refresh or close the window.</p>
                </div>
            `;

            // Realistic Fake Delay
            setTimeout(async () => {
                try {
                    const response = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: 'ORDER_' + transactionId,
                            razorpay_payment_id: 'PAY_' + transactionId,
                            razorpay_signature: 'DUMMY_SIG',
                            bookingData: bookingData
                        })
                    });
                    
                    const data = await response.json();

                    if (data.success) {
                        modalInner.innerHTML = `
                            <div class="text-center py-12">
                                <div class="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <i class="fa-solid fa-check text-4xl"></i>
                                </div>
                                <h3 class="text-3xl font-bold text-slate-50 mb-2">Payment Successful!</h3>
                                <p class="text-slate-400 mb-2">Transaction ID: <strong class="text-slate-200">${transactionId}</strong></p>
                                <p class="text-slate-400 mb-8">Your trip to <strong>${destination}</strong> is fully confirmed.</p>
                                <div class="space-y-3">
                                    <a href="my-bookings.html" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all">View My Bookings</a>
                                    <button onclick="window.location.reload()" class="text-slate-500 hover:text-slate-300 text-sm">Close</button>
                                </div>
                            </div>
                        `;
                    } else {
                        throw new Error(data.message);
                    }
                } catch (err) {
                    modalInner.innerHTML = `<div class="text-center py-20"><h3 class="text-red-500 font-bold">Booking Failed</h3><p>${err.message}</p><button onclick="window.location.reload()" class="mt-4 text-blue-500">Try Again</button></div>`;
                }
            }, 2500);
        });
    }

    // --- Auth Modal Tab Switches (Original preserved) ---
    if (tabSignup) tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('text-blue-600', 'bg-slate-900', 'shadow-sm'); tabSignup.classList.remove('text-slate-400');
        tabLogin.classList.remove('text-blue-600', 'bg-slate-900', 'shadow-sm'); tabLogin.classList.add('text-slate-400');
        document.getElementById('form-login').classList.add('hidden');
        document.getElementById('form-signup').classList.remove('hidden');
    });
    if (tabLogin) tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('text-blue-600', 'bg-slate-900', 'shadow-sm'); tabLogin.classList.remove('text-slate-400');
        tabSignup.classList.remove('text-blue-600', 'bg-slate-900', 'shadow-sm'); tabSignup.classList.add('text-slate-400');
        document.getElementById('form-signup').classList.add('hidden');
        document.getElementById('form-login').classList.remove('hidden');
    });
});
