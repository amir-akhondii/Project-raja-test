/* store.js — تنها منبع حقیقت نوین‌شاپ (دیتا + هلپر + auth)
   فروشگاه، پنل مدیر و پنل مشتری هر سه از همین فایل استفاده می‌کنند. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const faNum = n => Number(n || 0).toLocaleString('fa-IR');
const money = n => faNum(n) + ' تومان';

const DB = {
  read(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } },
  write(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(k); },
};

const CATS = [
  { key: 'mobile', fa: 'موبایل', icon: 'fa-mobile-screen', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', count: 120,
    subs: [['گوشی پرچمدار', 'نوا'], ['گوشی اقتصادی', 'اکو'], ['پاوربانک و شارژر', 'پاوربانک']] },
  { key: 'audio', fa: 'صوتی و تصویری', icon: 'fa-headphones', color: 'linear-gradient(135deg,#ec4899,#f43f5e)', count: 85,
    subs: [['هدفون', 'هدفون'], ['ایرپادز', 'ایرپادز'], ['اسپیکر', 'اسپیکر']] },
  { key: 'wear', fa: 'پوشیدنی', icon: 'fa-stopwatch', color: 'linear-gradient(135deg,#06b6d4,#3b82f6)', count: 64,
    subs: [['ساعت هوشمند', 'ساعت'], ['دستبند سلامتی', 'دستبند'], ['واقعیت مجازی', 'واقعیت']] },
  { key: 'home', fa: 'خانه هوشمند', icon: 'fa-house-laptop', color: 'linear-gradient(135deg,#f59e0b,#f97316)', count: 92,
    subs: [['جارو رباتیک', 'جارو'], ['روشنایی هوشمند', 'لامپ'], ['گیمینگ', 'کیبورد']] },
];
const catFa = k => (CATS.find(c => c.key === k) || {}).fa || k;

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'گوشی موبایل نوا X5', cat: 'mobile', catFa: 'موبایل', price: 12500000, old: 13900000, rating: 4.8, sales: 1250, stock: 20, img: 'assets/images/products/phone-nova.jpg', desc: 'گوشی پرچمدار با دوربین 108 مگاپیکسلی، حافظه 256 گیگ و باتری 5000 میلی‌آمپر.' },
  { id: 2, name: 'هدفون بلوتوثی پرو', cat: 'audio', catFa: 'صوتی', price: 1890000, old: 2490000, rating: 4.9, sales: 2100, stock: 35, img: 'assets/images/products/headphone-pro.jpg', desc: 'حذف نویز فعال، 36 ساعت پخش موسیقی و کیفیت صدای Hi-Fi.' },
  { id: 3, name: 'ساعت هوشمند فیت 2', cat: 'wear', catFa: 'پوشیدنی', price: 3490000, old: 3990000, rating: 4.7, sales: 980, stock: 15, img: 'assets/images/products/watch-fit.jpg', desc: 'صفحه AMOLED، ضدآب 5ATM، پایش ضربان قلب و اکسیژن خون.' },
  { id: 4, name: 'اسپیکر پارتی باکس', cat: 'audio', catFa: 'صوتی', price: 2750000, old: 3200000, rating: 4.6, sales: 640, stock: 12, img: 'assets/images/products/speaker-party.jpg', desc: 'صدای 360 درجه، نورپردازی RGB و 18 ساعت شارژدهی.' },
  { id: 5, name: 'جارو رباتیک هوشمند', cat: 'home', catFa: 'خانه', price: 8900000, old: 9900000, rating: 4.5, sales: 420, stock: 8, img: 'assets/images/products/vacuum-robot.jpg', desc: 'نقشه‌برداری لیزری، کنترل با اپلیکیشن و مکش 4000 پاسکال.' },
  { id: 6, name: 'ایرپادز ایر لایت', cat: 'audio', catFa: 'صوتی', price: 1490000, old: 0, rating: 4.4, sales: 1800, stock: 40, img: 'assets/images/products/earbuds-lite.jpg', desc: 'طراحی ارگونومیک، تاخیر صفر برای گیم و شارژ سریع.' },
  { id: 7, name: 'گوشی اکو A20', cat: 'mobile', catFa: 'موبایل', price: 7400000, old: 8200000, rating: 4.3, sales: 760, stock: 18, img: 'assets/images/products/phone-eco.jpg', desc: 'اقتصادی و قدرتمند با نمایشگر 120 هرتز و شارژ 67 وات.' },
  { id: 8, name: 'دستبند سلامتی بند 8', cat: 'wear', catFa: 'پوشیدنی', price: 1290000, old: 1590000, rating: 4.6, sales: 1500, stock: 50, img: 'assets/images/products/band-8.jpg', desc: '14 روز شارژدهی، 150 حالت ورزشی و سبک و راحت.' },
  { id: 9, name: 'لامپ هوشمند RGB', cat: 'home', catFa: 'خانه', price: 480000, old: 650000, rating: 4.7, sales: 900, stock: 60, img: 'assets/images/products/lamp-rgb.jpg', desc: '16 میلیون رنگ، کنترل صوتی و اتصال به وای‌فای.' },
  { id: 10, name: 'کیبورد مکانیکال گیمینگ', cat: 'home', catFa: 'خانه', price: 2150000, old: 0, rating: 4.8, sales: 350, stock: 22, img: 'assets/images/products/keyboard-gaming.jpg', desc: 'سوئیچ مکانیکال، نور RGB و بدنه آلومینیومی.' },
  { id: 11, name: 'پاوربانک 20000 فست', cat: 'mobile', catFa: 'موبایل', price: 980000, old: 1200000, rating: 4.5, sales: 1300, stock: 45, img: 'assets/images/products/powerbank.jpg', desc: 'شارژ سریع 65 وات، نمایشگر دیجیتال و دو پورت.' },
  { id: 12, name: 'عینک واقعیت مجازی VR', cat: 'wear', catFa: 'پوشیدنی', price: 11200000, old: 12900000, rating: 4.9, sales: 280, stock: 6, img: 'assets/images/products/vr-headset.jpg', desc: 'رزولوشن 4K، میدان دید 110 درجه و کنترلر لمسی.' },
];

const Store = {
  products() { const p = DB.read('novin_products', null); return p?.length ? p : DEFAULT_PRODUCTS; },
  saveProducts: p => DB.write('novin_products', p),
  cart: () => DB.read('novin_cart', []),
  saveCart: c => DB.write('novin_cart', c),
  wish: () => DB.read('novin_wish', []),
  saveWish: w => DB.write('novin_wish', w),
  orders: () => DB.read('novin_orders', []),
  saveOrders: o => DB.write('novin_orders', o),
  users() {
    const demo = [
      { username: 'admin', pass: '1234', role: 'admin', name: 'مدیر فروشگاه', phone: '02191009000' },
      { username: 'user', pass: '1234', role: 'customer', name: 'مشتری نمونه', phone: '09120000000', address: 'تهران، خیابان ولیعصر' },
      { username: 'sara', pass: '1234', role: 'customer', name: 'سارا محمدی', phone: '09123456781', address: 'تهران، سعادت‌آباد' },
      { username: 'amir', pass: '1234', role: 'customer', name: 'امیر رضایی', phone: '09123456782', address: 'اصفهان، خیابان چهارباغ' },
      { username: 'negar', pass: '1234', role: 'customer', name: 'نگار کریمی', phone: '09123456783', address: 'شیراز، قصرالدشت' },
      { username: 'reza', pass: '1234', role: 'customer', name: 'رضا احمدی', phone: '09123456784', address: 'مشهد، احمدآباد' },
      { username: 'maryam', pass: '1234', role: 'customer', name: 'مریم حسینی', phone: '09123456785', address: 'تبریز، ولیعصر' },
    ];
    let u = DB.read('novin_users', null);
    if (!u?.length) { u = demo; }
    else {
      // دیتای قدیمی مرورگر: مشتری‌های دموی کم‌شده را اضافه کن (بدون دست‌زدن به بقیه)
      let changed = false;
      demo.forEach(d => { if (!u.some(x => x.username === d.username)) { u.push(d); changed = true; } });
      if (!changed) return u;
    }
    DB.write('novin_users', u);
    return u;
  },
  saveUsers: u => DB.write('novin_users', u),
  session: () => DB.read('novin_session', null),
  login(u, p) {
    const user = Store.users().find(x => x.username === (u || '').trim() && x.pass === (p || '').trim());
    if (!user) return null;
    DB.write('novin_session', { username: user.username, role: user.role });
    return user;
  },
  logout: () => DB.del('novin_session'),
  me() { const s = Store.session(); return s ? Store.users().find(u => u.username === s.username) : null; },
  /* دیتای نمایشی: فقط یک‌بار (پرچم novin_demo_seeded) و فقط وقتی سفارشی نیست */
  seedDemoOrders() {
    if (localStorage.getItem('novin_demo_seeded')) return;
    const existing = DB.read('novin_orders', null);
    if (existing?.length) { localStorage.setItem('novin_demo_seeded', '1'); return; }
    const P = Store.products();
    const pick = id => P.find(p => p.id === id);
    const mk = (code, username, customer, phone, items, status, date) => {
      const lines = items.map(([id, qty]) => { const p = pick(id); return { id: p.id, name: p.name, price: p.price, qty }; });
      return { id: 9000 + code, code: 'NV-' + code, username, customer, phone, address: '',
        items: lines, count: lines.reduce((s, i) => s + i.qty, 0),
        total: lines.reduce((s, i) => s + i.price * i.qty, 0),
        status, date };
    };
    DB.write('novin_orders', [
      mk(4101, 'sara', 'سارا محمدی', '09123456781', [[2, 1], [6, 1]], 'done', '۱۴۰۵/۰۷/۱۰، ۱۴:۳۲'),
      mk(4102, 'amir', 'امیر رضایی', '09123456782', [[3, 1]], 'done', '۱۴۰۵/۰۷/۱۱، ۱۰:۰۵'),
      mk(4103, 'negar', 'نگار کریمی', '09123456783', [[4, 1], [9, 2]], 'pending', '۱۴۰۵/۰۷/۱۱، ۱۸:۴۷'),
      mk(4104, 'user', 'مشتری نمونه', '09120000000', [[11, 2]], 'pending', '۱۴۰۵/۰۷/۱۲، ۰۹:۱۲'),
      mk(4105, 'reza', 'رضا احمدی', '09123456784', [[7, 1]], 'cancel', '۱۴۰۵/۰۷/۱۲، ۱۱:۵۸'),
    ]);
    localStorage.setItem('novin_demo_seeded', '1');
  },
};

function toast(msg) {
  let w = $('.toasts, .toast-wrap');
  if (!w) { w = document.createElement('div'); w.className = 'toasts'; w.style.cssText = 'position:fixed;bottom:16px;right:16px;display:flex;flex-direction:column;gap:.5rem;z-index:200'; document.body.append(w); }
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
  d.style.cssText = 'background:#161a30;color:#fff;padding:.7rem 1.1rem;border-radius:10px;font-size:.88rem';
  w.append(d); setTimeout(() => d.remove(), 2400);
}
