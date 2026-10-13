/* shop.js — منطق فروشگاه (همان فرانت کامل قبلی، ولی دیتا از store.js) */
let PRODUCTS = Store.products();
const findP = id => PRODUCTS.find(x => x.id === Number(id));

let cart = Store.cart(), wishlist = Store.wish();
let activeCat = 'all', activeSort = 'new', visibleCount = 8, discount = 0, quickId = null, quickQty = 1;
const save = () => { Store.saveCart(cart); Store.saveWish(wishlist); };

/* دسته‌بندی‌ها */
function renderCats() {
  const el = $('#cats'); if (!el) return;
  el.innerHTML = CATS.map(c => `
    <div class="cat" onclick="filterBy('${c.key}')">
      <div class="ic" style="background:${c.color}"><i class="fa-solid ${c.icon}"></i></div>
      <strong>${c.fa}</strong><br><small>${faNum(c.count)} محصول</small>
    </div>`).join('');
}
window.filterBy = key => {
  activeCat = key;
  const inp = $('#searchInput'); if (inp) inp.value = '';
  $$('#filterPills button').forEach(b => b.classList.toggle('active', b.dataset.cat === key));
  renderProducts();
  $('#products').scrollIntoView({ behavior: 'smooth' });
};

/* مگامنوی دسته‌بندی‌ها */
function renderMega() {
  const box = $('#megaMenu'); if (!box) return;
  box.innerHTML = CATS.map(c => `
    <div class="mega-col">
      <h4 onclick="filterBy('${c.key}')"><span class="ic" style="background:${c.color}"><i class="fa-solid ${c.icon}"></i></span>${c.fa}</h4>
      ${c.subs.map(([label, q]) => `<a href="#products" onclick="filterSub('${c.key}','${q}')">${label}</a>`).join('')}
    </div>`).join('');
}
window.filterSub = (cat, q) => {
  activeCat = cat;
  $$('#filterPills button').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  const inp = $('#searchInput'); if (inp) inp.value = q;
  visibleCount = 8; renderProducts(); closeAll();
  $('#products').scrollIntoView({ behavior: 'smooth' });
};
window.resetFilters = () => {
  activeCat = 'all'; activeSort = 'new'; visibleCount = 8;
  const inp = $('#searchInput'); if (inp) inp.value = '';
  const sel = $('#sortSelect'); if (sel) sel.value = 'new';
  $$('#filterPills button').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
  renderProducts();
};
const megaWrap = $('#megaWrap'), catsLink = $('#catsLink');
if (catsLink) catsLink.addEventListener('click', e => {
  if (matchMedia('(max-width:900px)').matches) { e.preventDefault(); megaWrap.classList.toggle('open'); }
});
document.addEventListener('click', e => { if (megaWrap && !megaWrap.contains(e.target)) megaWrap.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') megaWrap?.classList.remove('open'); });

/* لیست + گرید محصولات */
function getFiltered() {
  let list = [...PRODUCTS];
  if (activeCat !== 'all') list = list.filter(p => p.cat === activeCat);
  const q = ($('#searchInput')?.value || '').trim();
  if (q) list = list.filter(p => p.name.includes(q));
  if (activeSort === 'cheap') list.sort((a, b) => a.price - b.price);
  if (activeSort === 'exp') list.sort((a, b) => b.price - a.price);
  if (activeSort === 'pop') list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
  return list;
}
function renderProducts() {
  const grid = $('#productGrid'); if (!grid) return;
  const list = getFiltered().slice(0, visibleCount);
  grid.innerHTML = list.length ? list.map(p => {
    const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const inWish = wishlist.includes(p.id);
    const stock = p.stock ?? 20, low = stock <= 8;
    const hot = (p.sales || 0) >= 1500, isNew = p.id >= 10;
    return `<div class="card">
      <div class="card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/products/phone-nova.jpg'"/>
        <div class="badges">
          ${off ? `<span class="off">${faNum(off)}٪ تخفیف</span>` : ''}
          ${hot ? `<span class="tag-hot">پرفروش</span>` : ''}
          ${isNew && !hot ? `<span class="tag-new">جدید</span>` : ''}
        </div>
        <button class="wish ${inWish ? 'active' : ''}" onclick="toggleWish(${p.id})" aria-label="علاقه"><i class="${inWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
        <div class="hover-act">
          <button onclick="openQuick(${p.id})"><i class="fa-regular fa-eye"></i> مشاهده سریع</button>
          <button onclick="addToCart(${p.id})"><i class="fa-solid fa-cart-plus"></i> افزودن</button>
        </div>
      </div>
      <div class="card-body">
        <small>${p.catFa} • ${faNum(p.sales || 0)} فروش</small>
        <h3>${p.name}</h3>
        <div class="stars">${'★'.repeat(Math.round(p.rating || 4))} <small>${faNum(p.rating || 4)}</small></div>
        <span class="stock ${low ? 'low' : 'ok'}">${low ? `تنها ${faNum(stock)} عدد مانده` : 'موجود در انبار'}</span>
        <div class="price"><strong>${money(p.price)}</strong>${p.old ? `<s>${money(p.old)}</s>` : ''}</div>
      </div>
      <div class="card-foot">
        <button class="add" onclick="addToCart(${p.id})"><i class="fa-solid fa-cart-plus"></i> افزودن</button>
        <button class="view" onclick="openQuick(${p.id})"><i class="fa-regular fa-eye"></i></button>
      </div>
    </div>`;
  }).join('') : `<div class="empty wide"><p>محصولی با این مشخصات پیدا نشد.</p><button class="btn btn-ghost" onclick="resetFilters()">حذف فیلترها</button></div>`;
  const rc = $('#resCount'); if (rc) rc.textContent = faNum(getFiltered().length) + ' محصول';
  const lm = $('#loadMore');
  if (lm) lm.style.display = getFiltered().length > visibleCount ? 'inline-flex' : 'none';
}

/* سبد + علاقه‌مندی */
function addToCart(id, qty = 1) {
  id = Number(id); if (!findP(id)) return;
  const f = cart.find(i => Number(i.id) === id);
  f ? f.qty += qty : cart.push({ id, qty });
  save(); renderCart(); toast('به سبد خرید اضافه شد');
}
window.addToCart = addToCart;
function changeQty(id, d) {
  id = Number(id);
  const f = cart.find(i => Number(i.id) === id); if (!f) return;
  f.qty += d; if (f.qty < 1) cart = cart.filter(i => Number(i.id) !== id);
  save(); renderCart();
}
window.changeQty = changeQty;
function removeItem(id) { cart = cart.filter(i => Number(i.id) !== Number(id)); save(); renderCart(); }
window.removeItem = removeItem;

const cartTotals = () => {
  const sub = cart.reduce((s, i) => { const p = findP(i.id); return p ? s + p.price * i.qty : s; }, 0);
  const disc = Math.round(sub * discount);
  return { sub, disc, total: sub - disc };
};
function renderCart() {
  if (!$('#cartItems')) return;
  cart = cart.filter(i => findP(i.id));
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = faNum(count);
  $('#drawerCount').textContent = count ? `(${faNum(count)} کالا)` : '';
  $('#wishlistCount').textContent = faNum(wishlist.length);
  $('#cartItems').innerHTML = cart.length ? cart.map(i => {
    const p = findP(i.id); if (!p) return '';
    return `<div class="c-item">
      <img src="${p.img}" alt=""/>
      <div class="inf"><strong>${p.name}</strong><small>${money(p.price)}</small>
        <div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${faNum(i.qty)}</span><button onclick="changeQty(${p.id},1)">+</button></div>
      </div>
      <button class="icon-btn" onclick="removeItem(${p.id})"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  }).join('') : '<div class="empty"><i class="fa-solid fa-cart-shopping" style="font-size:3rem"></i><p>سبد خرید خالی است</p></div>';
  const t = cartTotals();
  $('#subTotal').textContent = money(t.sub);
  $('#discountVal').textContent = money(t.disc);
  $('#grandTotal').textContent = money(t.total);
  const pa = $('#payAmount'); if (pa) pa.textContent = '(' + money(t.total) + ')';
  renderWish();
}
function renderWish() {
  const box = $('#wishItems'); if (!box) return;
  const valid = wishlist.filter(id => findP(id));
  box.innerHTML = valid.length ? valid.map(id => {
    const p = findP(id);
    return `<div class="c-item"><img src="${p.img}"/><div class="inf"><strong>${p.name}</strong><small>${money(p.price)}</small></div><button class="add" style="max-width:90px" onclick="addToCart(${p.id})">خرید</button></div>`;
  }).join('') : '<div class="empty">هنوز محصولی را نشان نکرده‌اید</div>';
}
window.toggleWish = id => {
  id = Number(id);
  if (wishlist.includes(id)) wishlist = wishlist.filter(x => x !== id);
  else { wishlist.push(id); toast('به علاقه‌مندی اضافه شد'); }
  save(); renderProducts(); renderCart();
};

/* کشوها و مودال‌ها */
function openDrawer(which) {
  $('#overlay')?.classList.add('show');
  $(which === 'cart' ? '#cartDrawer' : '#wishDrawer')?.classList.add('open');
}
function closeAll() {
  $('#overlay')?.classList.remove('show');
  $$('.drawer').forEach(d => d.classList.remove('open'));
  $$('.modal').forEach(m => m.classList.remove('show'));
  $('#mobileNav')?.classList.remove('open');
}
$('#cartBtn') && ($('#cartBtn').onclick = () => openDrawer('cart'));
$('#wishlistBtn') && ($('#wishlistBtn').onclick = () => openDrawer('wish'));
$('#closeCart') && ($('#closeCart').onclick = closeAll);
$('#closeWish') && ($('#closeWish').onclick = closeAll);
$('#overlay') && ($('#overlay').onclick = closeAll);
$('#clearCart') && ($('#clearCart').onclick = () => { cart = []; discount = 0; save(); renderCart(); });

/* مشاهده سریع */
window.openQuick = id => {
  const p = findP(id); if (!p) return;
  quickId = p.id; quickQty = 1; $('#qQty').textContent = '۱';
  $('#qImg').src = p.img; $('#qCat').textContent = p.catFa; $('#qName').textContent = p.name;
  $('#qStars').textContent = '★'.repeat(Math.round(p.rating || 4)) + ` ${faNum(p.rating || 4)} (${faNum(p.sales || 0)} دیدگاه)`;
  $('#qDesc').textContent = p.desc || ''; $('#qPrice').textContent = money(p.price); $('#qOld').textContent = p.old ? money(p.old) : '';
  $('#quickModal').classList.add('show');
};
$('#closeQuick') && ($('#closeQuick').onclick = closeAll);
$('#qPlus') && ($('#qPlus').onclick = () => { quickQty++; $('#qQty').textContent = faNum(quickQty); });
$('#qMinus') && ($('#qMinus').onclick = () => { if (quickQty > 1) quickQty--; $('#qQty').textContent = faNum(quickQty); });
$('#qAdd') && ($('#qAdd').onclick = () => { addToCart(quickId, quickQty); closeAll(); openDrawer('cart'); });
$('#qWish') && ($('#qWish').onclick = () => toggleWish(quickId));
$$('[data-add]').forEach(b => b.onclick = () => addToCart(+b.dataset.add));

/* تسویه → ذخیره سفارش برای پنل‌ها */
$('#checkoutBtn') && ($('#checkoutBtn').onclick = () => {
  if (!cart.length) return toast('سبد خرید خالی است');
  closeAll(); $('#checkModal').classList.add('show'); renderCart();
});
$('#closeCheck') && ($('#closeCheck').onclick = closeAll);
$('#checkForm') && ($('#checkForm').onsubmit = e => {
  e.preventDefault();
  const t = cartTotals(), me = Store.me(), orders = Store.orders();
  orders.unshift({
    id: Date.now(), code: 'NV-' + Math.floor(1000 + Math.random() * 9000),
    username: me?.username || null, customer: $('#fName').value, phone: $('#fPhone').value,
    address: $('#fAddr').value, ship: $('#fShip').value,
    items: cart.map(i => { const p = findP(i.id); return { id: p.id, name: p.name, price: p.price, qty: i.qty }; }),
    count: cart.reduce((s, i) => s + i.qty, 0), total: t.total, status: 'pending',
    date: new Date().toLocaleString('fa-IR'),
  });
  Store.saveOrders(orders);
  closeAll(); cart = []; discount = 0; save(); renderCart();
  toast('سفارش شما با موفقیت ثبت شد'); e.target.reset();
});

/* کد تخفیف */
$('#couponBtn') && ($('#couponBtn').onclick = () => {
  const v = $('#couponInput').value.trim().toUpperCase();
  if (v === 'NOVIN40') { discount = .4; toast('کد ۴۰٪ اعمال شد'); }
  else if (v === 'NOVIN10') { discount = .1; toast('کد ۱۰٪ اعمال شد'); }
  else { discount = 0; toast('کد معتبر نیست'); }
  renderCart();
});
$('#copyCode') && ($('#copyCode').onclick = () => { try { navigator.clipboard?.writeText('NOVIN40'); } catch {} toast('کد کپی شد: NOVIN40'); });

/* فیلتر / مرتب‌سازی / جستجو */
$$('#filterPills button').forEach(b => b.onclick = () => {
  activeCat = b.dataset.cat;
  $$('#filterPills button').forEach(x => x.classList.remove('active')); b.classList.add('active');
  visibleCount = 8; renderProducts();
});
const sortSel = $('#sortSelect'); if (sortSel) sortSel.onchange = e => { activeSort = e.target.value; renderProducts(); };
const sInput = $('#searchInput'); if (sInput) sInput.oninput = renderProducts;
const lmBtn = $('#loadMore'); if (lmBtn) lmBtn.onclick = () => { visibleCount += 4; renderProducts(); };

/* آکاردئون + خبرنامه */
$$('.acc button').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));
const nf = $('#newsForm'); if (nf) nf.onsubmit = e => { e.preventDefault(); toast('عضویت شما ثبت شد، کد: NOVIN10'); e.target.reset(); };

/* تم */
const themeBtn = $('#themeBtn');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('novin_theme', t); } catch {}
  if (themeBtn) {
    const ic = themeBtn.querySelector('i'), lb = themeBtn.querySelector('span');
    if (ic) ic.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (lb) lb.textContent = t === 'dark' ? 'حالت روشن' : 'حالت تیره';
  }
}
try { setTheme(localStorage.getItem('novin_theme') || 'light'); } catch { setTheme('light'); }
if (themeBtn) themeBtn.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

/* منوی کاربری: نمایش نام کاربر لاگین‌کرده + خروج */
function renderUser() {
  const me = Store.me(), head = $('#umHead'), out = $('#logoutBtn');
  if (!head) return;
  if (me) {
    head.innerHTML = `<strong>${me.name}</strong><small>${Store.session().role === 'admin' ? 'مدیر فروشگاه' : 'مشتری'} • ${me.username}</small>`;
    if (out) out.style.display = 'flex';
  } else {
    head.innerHTML = '<strong>حساب کاربری</strong><small>وارد شوید یا ثبت‌نام کنید</small>';
    if (out) out.style.display = 'none';
  }
}
const userWrap = $('#userWrap');
if ($('#userBtn')) $('#userBtn').onclick = e => { e.stopPropagation(); megaWrap?.classList.remove('open'); userWrap.classList.toggle('open'); };
document.addEventListener('click', e => { if (userWrap && !userWrap.contains(e.target)) userWrap.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') userWrap?.classList.remove('open'); });
const lob = $('#logoutBtn');
if (lob) lob.onclick = () => { Store.logout(); renderUser(); toast('از حساب خارج شدید'); };

/* منوی موبایل */
const ham = $('#hamburger'); if (ham) ham.onclick = e => { e.stopPropagation(); $('#mobileNav').classList.toggle('open'); };
$$('.nav a').forEach(a => a.onclick = () => { if (a.id !== 'catsLink') $('#mobileNav')?.classList.remove('open'); });

/* اسکرول‌اسپای: هایلایت لینک نوبار بر اساس سکشن دیده‌شده */
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav > a, .has-mega > a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-35% 0px -55% 0px' });
  ['home', 'categories', 'products', 'offer', 'blog', 'faq'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

/* تایمر پیشنهاد */
let hh = 12, mm = 45, ss = 30;
setInterval(() => {
  const H = $('#h'); if (!H) return;
  if (ss > 0) ss--; else { ss = 59; if (mm > 0) mm--; else { mm = 59; if (hh > 0) hh--; } }
  H.textContent = String(hh).padStart(2, '0'); $('#m').textContent = String(mm).padStart(2, '0'); $('#s').textContent = String(ss).padStart(2, '0');
}, 1000);

/* شمارنده‌ها */
const counters = $$('[data-counter]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.counter; let cur = 0;
    const step = Math.ceil(end / 60);
    const t = setInterval(() => { cur += step; if (cur >= end) { cur = end; clearInterval(t); } el.firstChild.textContent = faNum(cur); }, 30);
    io.unobserve(el);
  }));
  counters.forEach(c => { c.prepend(document.createTextNode('0')); io.observe(c); });
}

/* بازگشت به بالا */
window.onscroll = () => $('#toTop')?.classList.toggle('show', scrollY > 600);
const tt = $('#toTop'); if (tt) tt.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* همگام‌سازی با ادمین + پیش‌پر کردن فرم از پروفایل مشتری */
window.addEventListener('storage', e => { if (e.key === 'novin_products') { PRODUCTS = Store.products(); renderProducts(); renderCart(); } });
(function prefill() {
  try {
    const me = Store.me(); if (!me || Store.session().role !== 'customer') return;
    if ($('#fName')) $('#fName').value = me.name || '';
    if ($('#fPhone')) $('#fPhone').value = me.phone || '';
    if ($('#fAddr')) $('#fAddr').value = me.address || '';
  } catch {}
})();

renderCats(); renderMega(); renderProducts(); renderCart(); renderUser();
