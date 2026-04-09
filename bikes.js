'use strict';

const API = window.location.hostname === 'localhost' ? '/api' : 'https://bike-rental-hub.onrender.com/api';

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
let selectedRating = 0;
let openTab       = 'book';

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
  try {
    const params = new URLSearchParams();
    if (activeCat !== 'all') params.set('category', activeCat);
    if (activeSort)          params.set('sort', activeSort);
    if (searchQuery)         params.set('search', searchQuery);

    const res  = await fetch(`${API}/bikes?${params}`);
    bikes = await res.json();
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

  counter.innerHTML = `Showing <span>${bikes.length}</span> bike${bikes.length !== 1 ? 's' : ''}`;

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
  renderReviews();

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

function resetModal() {
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
  const ic = document.getElementById('insuranceCheck');
  if (ic) ic.checked = true;
  document.getElementById('sumTotal').textContent     = '₹–';
  document.getElementById('sumGrandTotal').textContent = '₹–';
  selectedRating = 0;
  updateStarPicker(0);
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewText').value = '';
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
  const days     = Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
  const rental   = days * currentBike.price;
  const insurance = document.getElementById('insuranceCheck').checked ? 39 : 0;
  const grand    = rental + 19 + insurance;
  document.getElementById('sumTotal').textContent      = `₹${rental}`;
  document.getElementById('sumGrandTotal').textContent = `₹${grand}`;
  return { days, rental, grand };
}

window.applyCoupon = function() {
  const code = document.getElementById('couponCode').value.trim().toUpperCase();
  if (!code) return;
  alert('Invalid or expired coupon code.');
};

document.getElementById('insuranceCheck').addEventListener('change', calcSummary);

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
  if (pref === 'cash') {
    const s = document.getElementById('startDate').value;
    const e = document.getElementById('endDate').value;
    const days = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
    const rental = days * (currentBike ? currentBike.price : 0);
    const insurance = document.getElementById('insuranceCheck').checked ? 39 : 0;
    const grand = rental + 19 + insurance;
    const pickup = document.getElementById('pickupTime').value || '10:00';
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
        <div class="cash-row"><span>Duration</span><span>${days} day${days>1?'s':''}</span></div>
        <div class="cash-row"><span>Pickup Date</span><span>${s}</span></div>
        <div class="cash-row"><span>Pickup Time</span><span>${pickup}</span></div>
        <div class="cash-row"><span>Rental Charges</span><span>&#8377;${rental}</span></div>
        <div class="cash-row"><span>Platform Charges</span><span>&#8377;19</span></div>
        ${insurance ? `<div class="cash-row"><span>Insurance</span><span>&#8377;${insurance}</span></div>` : ''}
        <div class="cash-row total"><span>Total (Pay at Pickup)</span><span>&#8377;${grand}</span></div>
      </div>`;
    showStep(1, 'cash');
  } else {
    updatePayAmount();
    showStep(2);
  }
});

document.getElementById('confirmCashBtn').addEventListener('click', () => {
  const name  = document.getElementById('custName').value.trim() || 'Customer';
  const phone = document.getElementById('custPhone').value.trim();
  const from  = document.getElementById('startDate').value || 'TBD';
  const to    = document.getElementById('endDate').value   || 'TBD';
  const time  = document.getElementById('pickupTime').value || '10:00';
  const days  = (from !== 'TBD' && to !== 'TBD') ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000)) : 1;
  const rental = days * (currentBike ? currentBike.price : 0);
  const insurance = document.getElementById('insuranceCheck').checked ? 39 : 0;
  const grand = rental + 19 + insurance;
  const msg = encodeURIComponent(`Hi, I want to book *${currentBike.name}* (Cash on Pickup)\nFrom: ${from} To: ${to} (${days} day${days>1?'s':''})\nPickup Time: ${time}\nTotal: \u20b9${grand}\nName: ${name}\nPhone: ${phone}\nPlease confirm my booking. - Bike Rental Hub`);
  window.open(`https://wa.me/919391265697?text=${msg}`, '_blank');
});

function updatePayAmount() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  let rental = currentBike ? currentBike.price : 0;
  if (s && e && currentBike) {
    const days = Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
    rental = days * currentBike.price;
  }
  const insurance = document.getElementById('insuranceCheck').checked ? 39 : 0;
  const grand = rental + 19 + insurance;
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
document.getElementById('cardNum').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
});
document.getElementById('cardExpiry').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
  e.target.value = v;
});

// ── PAY NOW → SAVE BOOKING TO API ──
document.getElementById('payNowBtn').addEventListener('click', async () => {
  const btn = document.getElementById('payNowBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

  try {
    await saveBooking();
    showStep(3);
  } catch (err) {
    alert('Booking failed. Please try again.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
  }
});

async function saveBooking() {
  const s     = document.getElementById('startDate').value;
  const e     = document.getElementById('endDate').value;
  const days  = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
  const rental = days * (currentBike ? currentBike.price : 0);
  const insurance = document.getElementById('insuranceCheck').checked ? 39 : 0;
  const total = rental + 19 + insurance;
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
      payMethod
    })
  });

  if (!res.ok) throw new Error('Booking API error');
  const booking = await res.json();
  document.getElementById('bookingIdDisplay').textContent = booking.bookingId;
}

document.getElementById('doneBtn').addEventListener('click', closeModal);

// ── REVIEWS ──
async function renderReviews() {
  if (!currentBike) return;
  const list = document.getElementById('reviewsList');
  list.innerHTML = '<div class="no-reviews"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';

  try {
    const res     = await fetch(`${API}/reviews/${currentBike._id}`);
    const reviews = await res.json();

    if (!reviews.length) {
      list.innerHTML = '<div class="no-reviews">No reviews yet. Be the first!</div>';
      return;
    }

    list.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
          <div class="review-meta">
            <strong>${r.name}</strong>
            <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
        </div>
        <p class="review-text">${r.text}</p>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<div class="no-reviews">Could not load reviews.</div>';
  }
}

// ── STAR PICKER ──
function updateStarPicker(val) {
  document.querySelectorAll('.stars-input i').forEach((star, i) => star.classList.toggle('active', i < val));
}

document.querySelectorAll('.stars-input i').forEach(star => {
  star.addEventListener('click',      () => { selectedRating = +star.dataset.val; updateStarPicker(selectedRating); });
  star.addEventListener('mouseenter', () => updateStarPicker(+star.dataset.val));
  star.addEventListener('mouseleave', () => updateStarPicker(selectedRating));
});

document.getElementById('submitReviewBtn').addEventListener('click', async () => {
  const name = document.getElementById('reviewName').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  if (!name || !text || !selectedRating) { alert('Please fill in your name, rating, and review.'); return; }

  try {
    const res = await fetch(`${API}/reviews/${currentBike._id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating: selectedRating, text })
    });
    if (!res.ok) throw new Error();
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    updateStarPicker(0);
    renderReviews();
  } catch {
    alert('Failed to submit review. Please try again.');
  }
});

// ── INIT ──
loadBikes();
