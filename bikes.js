'use strict';

const API = '/api';

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.background =
    window.scrollY > 50 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.97)';
});

// ── STATE ──
let bikes         = [];
let activeCat     = 'all';
let activeSort    = '';
let searchQuery   = '';
let currentBike   = null;
let openTab       = 'book';
let deliveryMode  = 'pickup';

// ── HELPERS ──
function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating))   html += '<i class="fas fa-star"></i>';
    else if (i - rating < 1)       html += '<i class="fas fa-star-half-stroke"></i>';
    else                           html += '<i class="far fa-star"></i>';
  }
  return html;
}

function badgeClass(badge) {
  const map = { Popular: 'badge-popular', Hot: 'badge-hot', Premium: 'badge-premium', Available: 'badge-available', New: 'badge-new' };
  return map[badge] || 'badge-available';
}

// ── FETCH BIKES FROM API ──
async function loadBikes() {
  const grid = document.getElementById('bikesGrid');
  if (grid && !grid.children.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#999"><i class="fas fa-spinner fa-spin" style="font-size:32px"></i></div>';
  }
  try {
    const params = new URLSearchParams();
    if (activeCat !== 'all') params.set('category', activeCat);
    if (activeSort)          params.set('sort', activeSort);
    if (searchQuery)         params.set('search', searchQuery);

    const res = await fetch(`${API}/bikes?${params}`);
    const data = await res.json();
    bikes = Array.isArray(data) ? data : [];
    renderBikes();
  } catch (err) {
    console.error('Failed to load bikes:', err);
    const grid = document.getElementById('bikesGrid');
    grid.innerHTML = '';
    document.getElementById('noResults').classList.remove('hidden');
    document.getElementById('noResults').innerHTML =
      '<i class="fas fa-triangle-exclamation"></i><p>Could not load bikes. Make sure the server is running.</p>';
    document.getElementById('bikesCount').innerHTML = '';
  }
}

// ── RENDER ──
function renderBikes() {
  const grid    = document.getElementById('bikesGrid');
  const noRes   = document.getElementById('noResults');
  const counter = document.getElementById('bikesCount');
  if (!grid || !noRes || !counter) return;





  if (!bikes.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  grid.innerHTML = bikes.map((b, i) => {
    const isMaint  = b.status === 'maintenance';
    const isRented = b.status === 'rented';

    let statusOverlay = '';
    if (isMaint) {
      const from  = b.maintenanceFrom  ? `From: ${b.maintenanceFrom}`  : '';
      const until = b.maintenanceUntil ? `Available: ${b.maintenanceUntil}` : '';
      statusOverlay = `<div class="card-status-overlay overlay-maintenance">
        <i class="fas fa-wrench"></i>
        <span>Under Maintenance</span>
        ${from  ? `<small>${from}</small>`  : ''}
        ${until ? `<small>${until}</small>` : ''}
      </div>`;
    } else if (isRented) {
      const from  = b.rentedFrom  ? `From: ${b.rentedFrom}`  : '';
      const until = b.rentedUntil ? `Available: ${b.rentedUntil}` : '';
      statusOverlay = `<div class="card-status-overlay overlay-rented">
        <i class="fas fa-motorcycle"></i>
        <span>Currently Rented</span>
        ${from  ? `<small>${from}</small>`  : ''}
        ${until ? `<small>${until}</small>` : ''}
      </div>`;
    }

    return `
    <div class="bike-card ${isMaint ? 'card-maintenance' : isRented ? 'card-rented' : ''}" style="animation-delay:${i * 0.06}s">
      <div class="card-top-row">
        <div class="card-name">${b.name}</div>
        ${b.payAtPickup !== false ? '<div class="card-pay-badge"><i class="fas fa-circle-check"></i> Pay at Pickup Available</div>' : ''}
      </div>
      <div class="card-img-wrap">
        <img src="${b.img}" alt="${b.name}" loading="lazy" />
        ${statusOverlay}
      </div>
      <a href="#" class="card-packages-btn" onclick="openModal('${b._id}','book');return false;">View All Packages</a>
      <div class="card-specs">
        <span><i class="fas fa-gears"></i> ${b.transmission || 'Manual'}</span>
        <span><i class="fas fa-user-group"></i> ${b.seats || '2 Seater'}</span>
        <span><i class="fas fa-gas-pump"></i> ${b.fuelType || 'Petrol'}</span>
      </div>
      ${b.availableAt ? `<div class="card-available-at"><small>Available at</small><p>${b.availableAt}</p></div>` : ''}
      <div class="card-pricing">
        <div class="card-price-block">
          <div class="card-price">&#8377;${b.price} <small>(incl. Tax)</small></div>
          ${b.kmLimit ? `<div class="card-limit">${b.kmLimit} Km limit</div>` : ''}
          ${b.extraPerKm ? `<div class="card-extra">Extra: &#8377;${b.extraPerKm}/Km</div>` : ''}
          <div class="card-fuel-label">${b.fuelIncluded ? 'Fuel Included' : 'Fuel Excluded'}</div>
        </div>
        <button class="card-rent-btn" onclick="openModal('${b._id}','book')" ${isMaint || isRented ? 'disabled' : ''}>Rent Now</button>
      </div>
      ${(b.deposit || b.manufacturedYear) ? `<div class="card-footer-row">
        ${b.deposit ? `<span>Deposit : &#8377;${b.deposit}</span>` : ''}
        ${b.manufacturedYear ? `<span>Manufactured Year : ${b.manufacturedYear}</span>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

// ── FILTERS ──
document.getElementById('filterCats').addEventListener('click', e => {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  loadBikes();
});

document.getElementById('sortSelect').addEventListener('change', e => {
  activeSort = e.target.value;
  loadBikes();
});

let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { searchQuery = e.target.value.trim(); loadBikes(); }, 300);
});

// ── MODAL ──
const overlay = document.getElementById('modalOverlay');

window.openModal = function (bikeId, mode) {
  currentBike = bikes.find(b => b._id === bikeId);
  if (!currentBike) return;

  resetModal();
  populateBikeHeader();

  switchTab('book');
  showStep(1);
  if (mode === 'pay') {
    document.getElementById('proceedPayBtn').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

window.setDelivery = function(mode) {
  deliveryMode = mode;
  document.getElementById('optPickup').classList.toggle('active', mode === 'pickup');
  document.getElementById('optDoorstep').classList.toggle('active', mode === 'doorstep');
  
  calcSummary();
};

function resetModal() {
  deliveryMode = 'pickup';
  ['custName', 'custPhone', 'startDate', 'endDate', 'upiId', 'cardNum', 'cardExpiry', 'cardCvv', 'cardName', 'couponCode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const pt = document.getElementById('pickupTime');
  if (pt) pt.value = '10:00';
  const dt = document.getElementById('dropTime');
  if (dt) dt.value = '10:00';
  const tc = document.getElementById('termsCheck');
  if (tc) tc.checked = false;
  document.getElementById('sumTotal').textContent     = '₹–';
  document.getElementById('sumGrandTotal').textContent = '₹–';
  
  document.getElementById('optPickup').classList.add('active');
  document.getElementById('optDoorstep').classList.remove('active');
}

function populateBikeHeader() {
  document.getElementById('modalBikeHeader').innerHTML = `
    <img src="${currentBike.img}" alt="${currentBike.name}" />
    <div>
      <h3>${currentBike.name}</h3>
      <p><i class="fas fa-location-dot" style="color:var(--orange)"></i> ${currentBike.location}</p>
      <div class="price">₹${currentBike.price}/day</div>
    </div>
  `;
}

// ── TABS ──
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function switchTab(name) {
  openTab = name;
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${name}`);
    c.classList.toggle('hidden', c.id !== `tab-${name}`);
  });
}

// ── STEPS ──
function showStep(n, sub) {
  ['step1','step2','step2b','step3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (sub === 'cash') {
    document.getElementById('step2b').classList.remove('hidden');
  } else {
    document.getElementById(`step${n}`).classList.remove('hidden');
  }
}

// ── DATE → SUMMARY ──
function calcSummary() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  if (!s || !e || !currentBike) return;
  
  const startDate = new Date(s);
  const endDate = new Date(e);
  const diffTime = endDate - startDate;
  const diffHours = diffTime / (1000 * 60 * 60);
  
  let days, discount = 0;
  
  // Calculate billing based on hours
  if (diffHours <= 24) {
    days = 1; // 1 Day
  } else if (diffHours <= 36) {
    days = 1.5; // 1.5 Day
  } else if (diffHours <= 48) {
    days = 2; // 2 Days
  } else {
    days = Math.ceil(diffHours / 24); // Full days for longer periods
  }
  
  // Apply discounts for longer rentals
  if (days >= 30) {
    discount = 0.45; // 45% discount for 30+ days
  } else if (days >= 15) {
    discount = 0.35; // 35% discount for 15+ days
  } else if (days >= 7) {
    discount = 0.15; // 15% discount for 7+ days
  }
  
  const baseRental = days * currentBike.price;
  const discountAmount = baseRental * discount;
  const rental = baseRental - discountAmount;
  
  // Don't include delivery in billing calculation
  const grand = rental;
  
  document.getElementById('sumTotal').textContent = `₹${Math.round(rental)}`;
  document.getElementById('sumGrandTotal').textContent = `₹${Math.round(grand)}`;
  
  return { days, rental: Math.round(rental), grand: Math.round(grand), discount };
}

window.applyCoupon = function() {
  const code = document.getElementById('couponCode').value.trim().toUpperCase();
  if (!code) return;
  alert('Invalid or expired coupon code.');
};

['startDate', 'endDate'].forEach(id => document.getElementById(id).addEventListener('change', calcSummary));

const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').min = today;
document.getElementById('endDate').min   = today;

// ── PAYMENT METHOD SELECTION ──
function validateStep1() {
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const from  = document.getElementById('startDate').value;
  const to    = document.getElementById('endDate').value;
  const terms = document.getElementById('termsCheck').checked;
  if (!name || !phone || !from || !to) { alert('Please fill in all fields before proceeding.'); return false; }
  if (new Date(to) < new Date(from))   { alert('End date must be after start date.'); return false; }
  if (!terms) { alert('Please agree to the Terms & Conditions before proceeding.'); return false; }
  return true;
}

document.getElementById('proceedPayBtn').addEventListener('click', () => {
  if (!validateStep1()) return;
  const pref = document.getElementById('payPreference').value;
  if (pref === 'online') {
    showStep(2);
    return;
  }
  // Cash on Pickup
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  const startD = new Date(s), endD = new Date(e);
  const diffHours = (endD - startD) / (1000 * 60 * 60);
  let days = diffHours <= 24 ? 1 : diffHours <= 36 ? 1.5 : diffHours <= 48 ? 2 : Math.ceil(diffHours / 24);
  let discount = days >= 30 ? 0.45 : days >= 15 ? 0.35 : days >= 7 ? 0.15 : 0;
  const baseRental = days * (currentBike ? currentBike.price : 0);
  const discountAmount = baseRental * discount;
  const rental = baseRental - discountAmount;
  const grand = Math.round(rental);
  const pickup = document.getElementById('pickupTime').value || '10:00';
  const drop   = document.getElementById('dropTime').value   || '10:00';
  document.getElementById('cashBikeSummary').innerHTML = `
    <div class="cash-bike-card">
      <img src="${currentBike.img}" alt="${currentBike.name}" />
      <div class="cash-bike-info">
        <h4>${currentBike.name}</h4>
        <div class="cash-stars">${'★'.repeat(Math.round(currentBike.rating||4))}${'☆'.repeat(5-Math.round(currentBike.rating||4))} <span>${currentBike.rating||'4.5'}</span></div>
        <p><i class="fas fa-location-dot"></i> ${currentBike.location || 'Karwan East, Hyderabad'}</p>
      </div>
    </div>
    <div class="cash-summary-rows">
      <div class="cash-row"><span>Customer</span><span>${document.getElementById('custName').value.trim()}</span></div>
      <div class="cash-row"><span>Phone</span><span>${document.getElementById('custPhone').value.trim()}</span></div>
      <div class="cash-row"><span>Duration</span><span>${days} day${days>1?'s':''}</span></div>
      <div class="cash-row"><span>From</span><span>${s}</span></div>
      <div class="cash-row"><span>To</span><span>${e}</span></div>
      <div class="cash-row"><span>Pickup Time</span><span>${pickup}</span></div>
      <div class="cash-row"><span>Drop Time</span><span>${drop}</span></div>
      <div class="cash-row"><span>Delivery</span><span>${deliveryMode === 'doorstep' ? 'Doorstep (+₹199 separately)' : 'Pick up at Store'}</span></div>
      <div class="cash-row"><span>Base Rental</span><span>&#8377;${Math.round(baseRental)}</span></div>
      ${discount > 0 ? `<div class="cash-row" style="color:#16a34a"><span>Discount (${Math.round(discount*100)}% off)</span><span>-&#8377;${Math.round(discountAmount)}</span></div>` : ''}
      <div class="cash-row total"><span>Total (Cash at Pickup)</span><span>&#8377;${grand}</span></div>
    </div>`;
  showStep(1, 'cash');
});

document.getElementById('confirmCashBtn').addEventListener('click', () => {
  const name  = document.getElementById('custName').value.trim() || 'Customer';
  const phone = document.getElementById('custPhone').value.trim();
  const from  = document.getElementById('startDate').value || 'TBD';
  const to    = document.getElementById('endDate').value   || 'TBD';
  const time  = document.getElementById('pickupTime').value || '10:00';
  const drop  = document.getElementById('dropTime').value  || '10:00';
  const startD = new Date(from), endD = new Date(to);
  const diffHours = (endD - startD) / (1000 * 60 * 60);
  let days = diffHours <= 24 ? 1 : diffHours <= 36 ? 1.5 : diffHours <= 48 ? 2 : Math.ceil(diffHours / 24);
  let discount = days >= 30 ? 0.45 : days >= 15 ? 0.35 : days >= 7 ? 0.15 : 0;
  const baseRental = days * (currentBike ? currentBike.price : 0);
  const grand = Math.round(baseRental - baseRental * discount);
  const deliveryText = deliveryMode === 'doorstep' ? 'Doorstep Delivery (+\u20b9199 payable to delivery person)' : 'Pick up at Store';
  const discountText = discount > 0 ? `\nDiscount: ${Math.round(discount*100)}% off` : '';
  const btn = document.getElementById('confirmCashBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting to WhatsApp...';
  const msg = encodeURIComponent(
    `Hi, I want to confirm my bike booking!\n\n` +
    `*Bike:* ${currentBike.name}\n` +
    `*Name:* ${name}\n` +
    `*Phone:* ${phone}\n` +
    `*From:* ${from}\n` +
    `*To:* ${to}\n` +
    `*Duration:* ${days} day${days>1?'s':''}\n` +
    `*Pickup Time:* ${time}\n` +
    `*Drop Time:* ${drop}\n` +
    `*Delivery:* ${deliveryText}` +
    discountText +
    `\n*Total:* \u20b9${grand} (Cash on Pickup)\n\n` +
    `Please confirm my booking. Thank you!`
  );
  setTimeout(() => {
    window.open(`https://wa.me/919391265697?text=${msg}`, '_blank');
    btn.disabled = false;
    btn.innerHTML = '<i class="fab fa-whatsapp"></i> Confirm Booking';
    showStep(3);
  }, 1500);
});

function updatePayAmount() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  let rental = currentBike ? currentBike.price : 0;
  if (s && e && currentBike) {
    const startDate = new Date(s);
    const endDate = new Date(e);
    const diffTime = endDate - startDate;
    const diffHours = diffTime / (1000 * 60 * 60);
    
    let days, discount = 0;
    
    if (diffHours <= 24) {
      days = 1;
    } else if (diffHours <= 36) {
      days = 1.5;
    } else if (diffHours <= 48) {
      days = 2;
    } else {
      days = Math.ceil(diffHours / 24);
    }
    
    if (days >= 30) {
      discount = 0.45;
    } else if (days >= 15) {
      discount = 0.35;
    } else if (days >= 7) {
      discount = 0.15;
    }
    
    const baseRental = days * currentBike.price;
    const discountAmount = baseRental * discount;
    rental = baseRental - discountAmount;
  }
  
  const grand = Math.round(rental);
  document.getElementById('payAmountDisplay').textContent = `₹${grand}`;
  return grand;
}

// ── PAY TABS ──
document.querySelectorAll('.pay-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pay-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('active'); });
    tab.classList.add('active');
    const content = document.getElementById(`pay-${tab.dataset.pay}`);
    content.classList.remove('hidden');
    content.classList.add('active');
  });
});

// ── CARD FORMAT ──
document.getElementById('cardNum')?.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
});
document.getElementById('cardExpiry')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
  e.target.value = v;
});

// ── PAY NOW → RAZORPAY CHECKOUT ──
document.getElementById('payNowBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('payNowBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

  try {
    const amount = updatePayAmount();

    // 1. Fetch key_id from backend
    const keyRes = await fetch(`${API}/payment/key`);
    const { key_id } = await keyRes.json();

    // 2. Create Razorpay order on backend
    const orderRes = await fetch(`${API}/payment/order`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ amount })
    });
    if (!orderRes.ok) throw new Error('Could not create payment order');
    const { orderId, amount: paise, currency } = await orderRes.json();

    // 3. Open Razorpay checkout popup
    const options = {
      key:         key_id,
      amount:      paise,
      currency,
      name:        'Bike Rental Hub',
      description: currentBike ? `Booking: ${currentBike.name}` : 'Bike Rental',
      image:       '/assets/logo.webp',
      order_id:    orderId,
      prefill: {
        name:    document.getElementById('custName').value.trim(),
        contact: document.getElementById('custPhone').value.trim()
      },
      theme: { color: '#ff7a00' },
      handler: async function (response) {
        // 4. Verify signature on backend
        const verifyRes = await fetch(`${API}/payment/verify`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature
          })
        });
        const verify = await verifyRes.json();
        if (!verify.success) { alert('Payment verification failed. Contact support.'); return; }

        // 5. Save booking to DB
        await saveBooking(response.razorpay_payment_id);
        showStep(3);
      },
      modal: {
        ondismiss: function () {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      alert('Payment failed: ' + resp.error.description);
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
    });
    rzp.open();

  } catch (err) {
    alert('Something went wrong. Please try again.');
    console.error(err);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
  }
});

async function saveBooking(paymentId = '') {
  const s     = document.getElementById('startDate').value;
  const e     = document.getElementById('endDate').value;
  
  const startDate = new Date(s);
  const endDate = new Date(e);
  const diffTime = endDate - startDate;
  const diffHours = diffTime / (1000 * 60 * 60);
  
  let days, discount = 0;
  
  if (diffHours <= 24) {
    days = 1;
  } else if (diffHours <= 36) {
    days = 1.5;
  } else if (diffHours <= 48) {
    days = 2;
  } else {
    days = Math.ceil(diffHours / 24);
  }
  
  if (days >= 30) {
    discount = 0.45;
  } else if (days >= 15) {
    discount = 0.35;
  } else if (days >= 7) {
    discount = 0.15;
  }
  
  const baseRental = days * (currentBike ? currentBike.price : 0);
  const discountAmount = baseRental * discount;
  const rental = baseRental - discountAmount;
  const total = Math.round(rental);
  
  const pickupTime = document.getElementById('pickupTime')?.value || '10:00';
  const dropTime   = document.getElementById('dropTime')?.value   || '10:00';

  const activePayTab = document.querySelector('.pay-tab.active');
  const payMethod    = activePayTab ? activePayTab.dataset.pay : 'upi';

  const res = await fetch(`${API}/bookings`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer:   document.getElementById('custName').value.trim(),
      phone:      document.getElementById('custPhone').value.trim(),
      bike:       currentBike.name,
      bikeId:     currentBike._id,
      from:       s,
      to:         e,
      pickupTime,
      dropTime,
      amount:     total,
      payMethod,
      delivery:   deliveryMode,
      paymentId
    })
  });

  if (!res.ok) throw new Error('Booking API error');
  const booking = await res.json();
  document.getElementById('bookingIdDisplay').textContent = booking.bookingId;
}

document.getElementById('doneBtn').addEventListener('click', closeModal);



// -- INIT --
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBikes);
} else {
  loadBikes();
}








