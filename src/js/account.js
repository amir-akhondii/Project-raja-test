/* account.js — پنل مشتری (پیشخوان + سفارش‌ها + علاقه‌مندی + پروفایل) */
Store.seedDemoOrders();
if (localStorage.getItem('novin_wish') === null) Store.saveWish([2, 8]);

function formErr(m) { const e = $('#loginErr'); if (e) { e.textContent = m; e.classList.toggle('show', !!m); clearTimeout(e._t); if (m) e._t = setTimeout(() => e.classList.remove('show'), 3500); } if (m) toast(m); }
$$('.pass-toggle').forEach(b => b.onclick = () => { const i = document.getElementById(b.dataset.for); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.querySelector('i').className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'; });
function selectTab(login) {
  $('#tabLogin').classList.toggle('active', login); $('#tabReg').classList.toggle('active', !login);
  $('#f').style.display = login ? 'flex' : 'none'; $('#r').style.display = login ? 'none' : 'flex';
  $('#authTitle').textContent = login ? 'ورود به حساب' : 'ساخت حساب جدید';
  formErr('');
}
$('#tabLogin').onclick = () => selectTab(true);
$('#tabReg').onclick = () => selectTab(false);
if (Store.session()?.role === 'customer') show();
$('#f').onsubmit = e => { e.preventDefault(); const u = Store.login($('#u').value, $('#p').value);
  if (!u) return formErr('نام کاربری یا رمز اشتباه است'); if (u.role !== 'customer') { Store.logout(); return formErr('این حساب مدیر است — از پنل مدیر وارد شوید'); } show(); };
$('#r').onsubmit = e => { e.preventDefault(); const users = Store.users();
  if (users.some(x => x.username === $('#ru').value.trim())) return formErr('این نام کاربری قبلا گرفته شده');
  users.push({ username: $('#ru').value.trim(), pass: $('#rp').value, role: 'customer', name: $('#rn').value.trim(), phone: '', address: '' });
  Store.saveUsers(users); Store.login($('#ru').value, $('#rp').value); show(); toast('حساب شما ساخته شد'); };
function show() { $('#login').style.display = 'none'; $('#app').style.display = 'grid';
  const me = Store.me(); $('#hello').textContent = 'سلام ' + me.name + '!'; $('#who').textContent = me.name; draw(); }
$('#out').onclick = () => { Store.logout(); location.reload(); };
$$('.side nav button[data-t]').forEach(b => b.onclick = () => { $$('.side nav button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  $$('.page').forEach(p => p.classList.remove('on')); $('#pg-' + b.dataset.t).classList.add('on'); $('#side').classList.remove('open'); });
$('#sideBtn').onclick = () => $('#side').classList.toggle('open');

function st(s) { return ({ pending: ['در انتظار', 'p-pending'], done: ['تکمیل شد', 'p-done'], cancel: ['لغوشده', 'p-cancel'] })[s] || ['در انتظار', 'p-pending']; }
function myOrders() { const me = Store.me(); return Store.orders().filter(o => o.username === me.username || o.customer === me.name); }

function draw() {
  const me = Store.me(); if (!me) return;
  const mine = myOrders(), wish = Store.wish(), cart = Store.cart();

  /* آمار */
  $('#sO').textContent = faNum(mine.length);
  $('#sM').textContent = money(mine.filter(o => o.status !== 'cancel').reduce((s, o) => s + o.total, 0));
  $('#sW').textContent = faNum(wish.length);
  $('#sC').textContent = faNum(cart.reduce((s, i) => s + i.qty, 0));
  $('#nO').textContent = faNum(mine.length);
  $('#nW').textContent = faNum(wish.length);

  /* آخرین سفارش */
  const lo = mine[0];
  $('#lastBox').innerHTML = lo
    ? `<div>کد <b>${lo.code}</b> — ${money(lo.total)} — <span class="pill ${(st(lo.status))[1]}">${st(lo.status)[0]}</span></div>`
    : '<div style="color:var(--muted)">هنوز سفارشی نداری — از فروشگاه شروع کن.</div>';

  /* جدول سفارش‌ها */
  $('#ot tbody').innerHTML = mine.map(o => {
    const items = (o.items || []).map(i => `${i.name} ×${faNum(i.qty)}`).join('، ');
    return `<tr><td><b>${o.code}</b></td>
      <td style="max-width:220px"><small>${items || faNum(o.count || 0) + ' قلم'}</small></td>
      <td>${money(o.total)}</td>
      <td><span class="pill ${st(o.status)[1]}">${st(o.status)[0]}</span></td>
      <td><small>${o.date || ''}</small></td></tr>`;
  }).join('') || '<tr><td colspan="5" style="text-align:center">سفارشی نیست</td></tr>';

  /* علاقه‌مندی‌ها */
  const prods = Store.products();
  const valid = wish.map(id => prods.find(p => p.id === Number(id))).filter(Boolean);
  $('#wishGrid').innerHTML = valid.map(p => `<div class="wcard">
      <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='assets/images/products/phone-nova.jpg'"/>
      <div><b>${p.name}</b><small>${money(p.price)}</small>
      <div style="display:flex;gap:.4rem"><button class="btn" style="flex:1;justify-content:center" onclick="buy(${p.id})">افزودن به سبد</button><button class="btn ghost" onclick="unwish(${p.id})">✕</button></div></div>
    </div>`).join('') || '<p style="color:var(--muted)">علاقه‌مندی خالی است — از فروشگاه قلب بزن.</p>';

  /* پروفایل */
  $('#fName').value = me.name || ''; $('#fPhone').value = me.phone || ''; $('#fAddr').value = me.address || ''; $('#fPass').value = '';
}
window.buy = id => {
  const cart = Store.cart(); const f = cart.find(i => Number(i.id) === Number(id));
  f ? f.qty++ : cart.push({ id: Number(id), qty: 1 });
  Store.saveCart(cart); toast('به سبد اضافه شد'); draw();
};
window.unwish = id => { Store.saveWish(Store.wish().filter(x => Number(x) !== Number(id))); draw(); };
$('#profForm').onsubmit = e => {
  e.preventDefault();
  const users = Store.users(), me = Store.me(), u = users.find(x => x.username === me.username); if (!u) return;
  u.name = $('#fName').value.trim(); u.phone = $('#fPhone').value.trim(); u.address = $('#fAddr').value.trim();
  if ($('#fPass').value.trim()) u.pass = $('#fPass').value.trim();
  Store.saveUsers(users);
  $('#hello').textContent = 'سلام ' + u.name + '!'; $('#who').textContent = u.name;
  toast('پروفایل ذخیره شد');
};
