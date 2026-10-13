/* admin.js — پنل مدیر (همان امکانات کامل قبلی، دیتا از store.js) */
Store.seedDemoOrders();

const CATFA = { mobile: 'موبایل', audio: 'صوتی', wear: 'پوشیدنی', home: 'خانه' };
const STATUS = { pending: ['در انتظار', 'b-pending'], done: ['تکمیل شد', 'b-done'], cancel: ['لغوشده', 'b-cancel'] };

const getProducts = () => Store.products();
const IMG_POOL = ['phone-nova', 'headphone-pro', 'watch-fit', 'speaker-party', 'vacuum-robot', 'earbuds-lite', 'phone-eco', 'band-8', 'lamp-rgb', 'keyboard-gaming', 'powerbank', 'vr-headset'];
const poolImg = i => 'assets/images/products/' + IMG_POOL[i % IMG_POOL.length] + '.jpg';
const setProducts = p => Store.saveProducts(p);
const getOrders = () => Store.orders();
const setOrders = o => Store.saveOrders(o);

/* ورود: فقط مدیر */
function formErr(m) { const e = $('#loginErr'); if (e) { e.textContent = m; e.classList.toggle('show', !!m); clearTimeout(e._t); if (m) e._t = setTimeout(() => e.classList.remove('show'), 3500); } if (m) toast(m); }
$$('.pass-toggle').forEach(b => b.onclick = () => { const i = document.getElementById(b.dataset.for); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.querySelector('i').className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'; });
(function initAuth() {
  const s = Store.session();
  if (s && s.role === 'admin') showApp();
  else if (s && s.role === 'customer') formErr('شما با حساب مشتری وارد شده‌اید — از پنل مشتری استفاده کنید');
})();
$('#loginForm').onsubmit = e => {
  e.preventDefault();
  const u = Store.login($('#u').value, $('#p').value);
  if (!u) return formErr('نام کاربری یا رمز اشتباه است');
  if (u.role !== 'admin') { Store.logout(); return formErr('این حساب مشتری است — از پنل مشتری وارد شوید'); }
  showApp(); toast('خوش آمدید ' + u.name);
};
function showApp() {
  $('#loginWrap').style.display = 'none'; $('#adminApp').style.display = 'grid';
  const me = Store.me(); if (me && $('#adminName')) $('#adminName').textContent = me.name;
  renderAll();
}
$('#logoutBtn').onclick = () => { Store.logout(); location.reload(); };

/* تب‌ها */
$$('.sidebar nav button[data-tab]').forEach(b => b.onclick = () => {
  $$('.sidebar nav button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#page-' + b.dataset.tab).classList.add('active');
  $('#sidebar').classList.remove('open');
});
$('#sideBtn').onclick = () => $('#sidebar').classList.toggle('open');

/* رندر */
function renderAll() {
  const prods = getProducts(), orders = getOrders();
  $('#todayDate').textContent = new Date().toLocaleDateString('fa-IR');
  $('#stProducts').textContent = faNum(prods.length);
  $('#stOrders').textContent = faNum(orders.length);
  $('#stIncome').textContent = faNum(orders.filter(o => o.status !== 'cancel').reduce((s, o) => s + o.total, 0));
  $('#stSold').textContent = faNum(orders.reduce((s, o) => s + (o.count || 0), 0));
  $('#navPCount').textContent = faNum(prods.length);
  $('#navOCount').textContent = faNum(orders.length);
  $('#navCCount').textContent = faNum(Store.users().filter(u => u.role !== 'admin').length);

  $('#recentTable tbody').innerHTML = orders.slice(0, 5).map(o => {
    const st = STATUS[o.status] || STATUS.pending;
    return `<tr><td>${o.code}</td><td>${o.customer || '-'}</td><td>${money(o.total)}</td><td><span class="badge ${st[1]}">${st[0]}</span></td></tr>`;
  }).join('') || '<tr><td colspan="4" style="text-align:center;color:#888">سفارشی ثبت نشده — از فروشگاه خرید کنید</td></tr>';

  const top = [...prods].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
  const max = top[0]?.sales || 1;
  $('#topBars').innerHTML = top.map(p => `<div class="bar"><div class="t"><span>${p.name}</span><span>${faNum(p.sales || 0)}</span></div><div class="o"><div class="f" style="width:${Math.round((p.sales || 0) / max * 100)}%"></div></div></div>`).join('');

  renderProducts(); renderOrders(); renderCustomers();
}

function renderProducts() {
  const q = ($('#globalSearch').value || '').trim();
  let prods = getProducts();
  if (q) prods = prods.filter(p => p.name.includes(q));
  $('#prodTable tbody').innerHTML = prods.map(p => `<tr>
    <td><div class="p-name"><img src="${p.img}" onerror="this.onerror=null;this.src='assets/images/products/phone-nova.jpg'"/><b>${p.name}</b></div></td>
    <td>${p.catFa || CATFA[p.cat]}</td>
    <td>${money(p.price)}</td>
    <td>${faNum(p.stock ?? 0)}</td>
    <td>${faNum(p.sales || 0)}</td>
    <td><button class="mini" onclick="editProd(${p.id})">ویرایش</button> <button class="mini del" onclick="delProd(${p.id})">حذف</button></td>
  </tr>`).join('') || '<tr><td colspan="6" style="text-align:center">محصولی نیست</td></tr>';
}

function renderOrders() {
  const q = ($('#globalSearch').value || '').trim();
  let orders = getOrders();
  if (q) orders = orders.filter(o => (o.customer || '').includes(q) || (o.code || '').includes(q));
  $('#orderTable tbody').innerHTML = orders.map(o => {
    const items = (o.items || []).map(i => `${i.name} ×${faNum(i.qty)}`).join('، ');
    return `<tr>
      <td><b>${o.code}</b></td>
      <td>${o.customer || '-'}<br><small style="color:#888">${o.phone || ''}</small></td>
      <td style="max-width:220px;white-space:normal"><small>${items || faNum(o.count || 0) + ' قلم'}</small></td>
      <td>${money(o.total)}</td>
      <td><small>${o.date || ''}</small></td>
      <td><select class="status" onchange="setStatus(${o.id},this.value)">
        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>در انتظار</option>
        <option value="done" ${o.status === 'done' ? 'selected' : ''}>تکمیل شد</option>
        <option value="cancel" ${o.status === 'cancel' ? 'selected' : ''}>لغوشده</option>
      </select></td>
      <td><button class="mini del" onclick="delOrder(${o.id})">حذف</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center">سفارشی نیست</td></tr>';
}

window.setStatus = (id, val) => { const o = getOrders(); const f = o.find(x => x.id === id); if (f) { f.status = val; setOrders(o); renderAll(); toast('وضعیت سفارش تغییر کرد'); } };
window.delOrder = id => { if (!confirm('حذف شود؟')) return; setOrders(getOrders().filter(x => x.id !== id)); renderAll(); };
$('#clearOrders').onclick = () => { if (!confirm('همه سفارش‌ها پاک شود؟')) return; setOrders([]); renderAll(); };

/* مشتریان: تعداد سفارش + مجموع خرید هر مشتری */
function renderCustomers() {
  const q = ($('#globalSearch').value || '').trim();
  const orders = getOrders();
  const rows = Store.users()
    .filter(u => u.role !== 'admin')
    .map(u => {
      const mine = orders.filter(o => o.username === u.username || o.customer === u.name);
      const total = mine.filter(o => o.status !== 'cancel').reduce((s, o) => s + o.total, 0);
      return { u, count: mine.length, total };
    })
    .filter(r => !q || r.u.name.includes(q) || r.u.username.includes(q) || (r.u.phone || '').includes(q));
  $('#custTable tbody').innerHTML = rows.map(({ u, count, total }) => `<tr>
    <td><div class="p-name"><span style="width:42px;height:42px;border-radius:10px;display:inline-grid;place-items:center;background:#e9e6ff;color:#5b4df6;font-weight:800">${u.name.trim()[0] || '؟'}</span><b>${u.name}</b><br><small style="color:#888">${u.username}</small></div></td>
    <td>${u.phone || '-'}</td>
    <td>${faNum(count)}</td>
    <td>${money(total)}</td>
    <td><button class="mini del" onclick="delCust('${u.username}')">حذف</button></td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center">مشتری نیست</td></tr>';
}
window.delCust = username => {
  if (!confirm('این مشتری حذف شود؟ (سفارش‌هایش می‌ماند)')) return;
  Store.saveUsers(Store.users().filter(u => u.username !== username));
  renderAll(); toast('مشتری حذف شد');
};

/* CRUD محصول */
$('#addBtn').onclick = () => { $('#prodForm').reset(); $('#fId').value = ''; $('#modalTitle').textContent = 'محصول جدید'; $('#prodModal').classList.add('show'); };
$('#closeModal').onclick = () => $('#prodModal').classList.remove('show');
window.editProd = id => {
  const p = getProducts().find(x => x.id === id); if (!p) return;
  $('#fId').value = p.id; $('#fName').value = p.name; $('#fCat').value = p.cat;
  $('#fPrice').value = p.price; $('#fOld').value = p.old || 0; $('#fStock').value = p.stock || 0;
  $('#fImg').value = p.img; $('#fDesc').value = p.desc || '';
  $('#modalTitle').textContent = 'ویرایش محصول'; $('#prodModal').classList.add('show');
};
window.delProd = id => { if (!confirm('این محصول از فروشگاه حذف شود؟')) return; setProducts(getProducts().filter(x => x.id !== id)); renderAll(); toast('حذف شد'); };
$('#prodForm').onsubmit = e => {
  e.preventDefault();
  const arr = getProducts();
  const id = $('#fId').value ? Number($('#fId').value) : Date.now();
  const cat = $('#fCat').value;
  const obj = { id, name: $('#fName').value.trim(), cat, catFa: catFa(cat), price: Number($('#fPrice').value || 0), old: Number($('#fOld').value || 0), stock: Number($('#fStock').value || 0), img: $('#fImg').value.trim() || poolImg(arr.length), desc: $('#fDesc').value.trim(), rating: 4.5, sales: 0 };
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) arr[i] = { ...arr[i], ...obj }; else arr.unshift(obj);
  setProducts(arr); $('#prodModal').classList.remove('show'); renderAll(); toast('ذخیره شد و در فروشگاه اعمال شد');
};

$('#resetBtn').onclick = () => { if (!confirm('بازگشت به دیتای پیش‌فرض؟')) return; ['novin_products', 'novin_orders', 'novin_users', 'novin_demo_seeded'].forEach(k => localStorage.removeItem(k)); location.reload(); };
$('#globalSearch').oninput = () => { renderProducts(); renderOrders(); renderCustomers(); };
