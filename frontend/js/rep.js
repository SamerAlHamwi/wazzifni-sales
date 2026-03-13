/* CLOCK */
let clockInterval;
function startClock() {
  clearInterval(clockInterval);
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}
function updateClock() {
  const now = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeDisplay = document.getElementById('rep-time-display');
  const dateDisplay = document.getElementById('rep-date-display');
  const dayDisplay = document.getElementById('rep-day-display');

  if (timeDisplay) timeDisplay.textContent = `${h}:${m}:${s}`;
  if (dateDisplay) dateDisplay.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  if (dayDisplay) dayDisplay.textContent = days[now.getDay()];
}

/* GPS */
function getGPS() {
  const btn = document.getElementById('btn-gps');
  const inp = document.getElementById('rep-gps');
  const status = document.getElementById('gps-status');

  if (!navigator.geolocation) {
    status.textContent = '⚠️ المتصفح لا يدعم تحديد الموقع.';
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳';
  status.textContent = 'جاري تحديد موقعك (يرجى التأكد من تفعيل GPS)...';

  const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(7);
      const lng = pos.coords.longitude.toFixed(7);
      inp.value = `${lat}, ${lng}`;
      status.innerHTML = `✅ تم التحديد &nbsp;<a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" style="color:var(--primary);font-size:11px;font-weight:600;">📍 عرض في الخريطة</a>`;
      btn.textContent = '✅';
      btn.disabled = false;
    },
    err => {
      console.error('GPS Error:', err);
      let errorMsg = '❌ تعذّر تحديد الموقع.';
      if (err.code === 1) errorMsg = '❌ تم رفض طلب الوصول للموقع.';
      else if (err.code === 2) errorMsg = '❌ الموقع غير متاح.';
      else if (err.code === 3) errorMsg = '❌ انتهى الوقت. حاول مرة أخرى.';

      status.textContent = errorMsg;
      btn.textContent = '📡';
      btn.disabled = false;
    },
    options
  );
}

/* FORM RENDERING & LOGIC */
function renderRepForm() {
  const sel = document.getElementById('rep-sel-name');
  if (!sel) return;
  sel.innerHTML = '<option value="">— اختر اسمك —</option>' + state.reps.map(r => `<option>${r}</option>`).join('');

  const list = document.getElementById('rep-actions-list');
  if (!list) return;
  if (!state.actions.length) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">لا توجد إجراءات. أضف إجراءات من لوحة الإدارة.</div>';
    return;
  }

  list.innerHTML = state.actions.map(a => `
    <div class="action-check-item">
      <input type="checkbox" id="chk-${a._id || a.name}" value="${a.name}" data-pts="${a.points}" onchange="updatePoints()"/>
      <label for="chk-${a._id || a.name}">${a.name}</label>
      <span class="action-check-pts">⭐ ${a.points}</span>
    </div>`).join('');
  updatePoints();
}

function updatePoints() {
  const checks = document.querySelectorAll('#rep-actions-list input[type=checkbox]:checked');
  let total = 0;
  checks.forEach(c => total += parseInt(c.dataset.pts) || 0);
  const ptsVal = document.getElementById('rep-pts-val');
  const iqdVal = document.getElementById('rep-iqd-val');
  if (ptsVal) ptsVal.textContent = total;
  if (iqdVal) iqdVal.textContent = (total * POINT_VALUE).toLocaleString() + ' د.ع';
}

async function submitRepReport() {
  const rep = document.getElementById('rep-sel-name').value;
  const company = document.getElementById('rep-company').value.trim();
  const phone = document.getElementById('rep-phone').value.trim();
  const email = document.getElementById('rep-email').value.trim();
  const address = document.getElementById('rep-address').value.trim();
  const gps = document.getElementById('rep-gps').value.trim();
  const notes = document.getElementById('rep-notes').value.trim();
  const msg = document.getElementById('rep-submit-msg');

  if (!rep) { showMsg(msg, 'اختر اسمك أولاً.', 'error'); return; }
  if (!company) { showMsg(msg, 'اكتب اسم الشركة.', 'error'); return; }

  const checks = document.querySelectorAll('#rep-actions-list input[type=checkbox]:checked');
  const actions = Array.from(checks).map(c => c.value);
  let total_points = 0;
  checks.forEach(c => total_points += parseInt(c.dataset.pts) || 0);

  const reportData = {
    rep_name: rep,
    company_name: company,
    company_phone: phone,
    company_email: email,
    company_address: address,
    company_gps: gps,
    actions,
    total_points,
    notes
  };

  try {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) throw new Error('Failed to submit report');

    const newReport = await response.json();
    state.reports.push(newReport);

    // Reset form
    ['rep-sel-name', 'rep-company', 'rep-phone', 'rep-email', 'rep-address', 'rep-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const gpsInp = document.getElementById('rep-gps');
    if (gpsInp) gpsInp.value = '';
    const gpsStatus = document.getElementById('gps-status');
    if (gpsStatus) gpsStatus.textContent = '';
    const gpsBtn = document.getElementById('btn-gps');
    if (gpsBtn) {
        gpsBtn.textContent = '📡';
        gpsBtn.disabled = false;
    }
    document.querySelectorAll('#rep-actions-list input[type=checkbox]').forEach(c => c.checked = false);
    updatePoints();

    const submitMsg = document.getElementById('rep-submit-msg');
    if (submitMsg) submitMsg.innerHTML = '';
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.classList.add('show');
  } catch (err) {
    console.error('Error submitting report:', err);
    showMsg(msg, 'حدث خطأ أثناء إرسال التقرير.', 'error');
  }
}

function closeSuccess() {
  const overlay = document.getElementById('success-overlay');
  if (overlay) overlay.classList.remove('show');
}

// Initialize if on rep page
if (document.getElementById('page-rep')) {
    startClock();
}