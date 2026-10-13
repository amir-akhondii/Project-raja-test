/* chat.js — چت پشتیبانی با پاسخ هوشمند کلیدواژه‌ای */
const chatBody = $('#chatBody'), chatPanel = $('#chatPanel'), chatBadge = $('#chatBadge');
let chatHist = [];
try { chatHist = JSON.parse(localStorage.getItem('novin_chat') || '[]').slice(-30); } catch { chatHist = []; }
const saveChat = () => { try { localStorage.setItem('novin_chat', JSON.stringify(chatHist.slice(-30))); } catch {} };

function addMsg(text, who) {
  const d = document.createElement('div');
  d.className = 'msg ' + who; d.textContent = text;
  chatBody.append(d); chatBody.scrollTop = chatBody.scrollHeight;
}
function renderHist() { chatBody.innerHTML = ''; chatHist.forEach(m => addMsg(m.t, m.w)); }

const norm = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').trim();
function botReply(q) {
  q = norm(q);
  if (/(سلام|درود|هی|hello)/i.test(q)) return 'سلام! 👋 به نوین‌شاپ خوش اومدی. درباره تخفیف، ارسال یا پیگیری سفارش بپرس.';
  if (q.includes('تخفیف') || q.includes('کد')) return 'کد NOVIN40 یعنی ۴۰٪ تخفیف و NOVIN10 یعنی ۱۰٪ — توی سبد خرید واردش کن.';
  if (q.includes('ارسال') || q.includes('پست') || q.includes('تحویل') || q.includes('میرسه')) return 'خرید بالای ۵۰۰ هزار تومان ارسالش رایگانه؛ تهران ۲۴ ساعته و شهرستان ۲ تا ۴ روز کاری می‌رسه.';
  if (q.includes('گارانتی') || q.includes('ضمانت') || q.includes('اصالت')) return 'همه محصولات ۱۸ ماه گارانتی شرکتی و کد رهگیری اصالت دارن.';
  if (q.includes('مرجوع') || q.includes('بازگشت') || q.includes('پس بدم')) return 'تا ۷ روز بدون قید و شرط می‌تونی با بسته‌بندی سالم برگردونی و مبلغ ظرف ۴۸ ساعت برمی‌گرده.';
  if (q.includes('سفارش') || q.includes('پیگیری') || q.includes('کجاست')) return 'کد سفارشت (مثل NV-4101) رو از پنل مشتری ببین؛ اگه وارد شدی وضعیتش اونجاست. کمکی دیگه لازم داری؟';
  if (q.includes('قیمت') || q.includes('هزینه') || q.includes('گرون')) return 'با کد NOVIN40 تا ۴۰٪ ارزون‌تر می‌خری! مرتب‌سازی «ارزان‌ترین» هم توی فروشگاه هست.';
  if (q.includes('تلفن') || q.includes('تماس') || q.includes('ساعت') || q.includes('پشتیبانی')) return 'پشتیبانی ۲۴/۷ هستیم: 021-91009000 — همینجا هم در خدمتم.';
  if (q.includes('مرسی') || q.includes('ممنون') || q.includes('خداحافظ') || q.includes('فعلا')) return 'خواهش می‌کنم! 🌟 خرید خوبی داشته باشی.';
  return 'متوجه نشدم دقیقاً... 🤔 درباره «تخفیف»، «ارسال»، «گارانتی» یا «پیگیری سفارش» بپرس.';
}
function sendChat(text) {
  text = (text || '').trim(); if (!text) return;
  chatHist.push({ t: text, w: 'me' }); addMsg(text, 'me'); saveChat();
  $('#chatInput').value = '';
  const tp = document.createElement('div');
  tp.className = 'msg bot typing'; tp.innerHTML = '<span></span><span></span><span></span>';
  chatBody.append(tp); chatBody.scrollTop = chatBody.scrollHeight;
  setTimeout(() => {
    tp.remove();
    const r = botReply(text);
    chatHist.push({ t: r, w: 'bot' }); addMsg(r, 'bot'); saveChat();
  }, 700);
}
window.sendChat = sendChat;

let greeted = false;
function toggleChat(force) {
  const open = force !== undefined ? force : !chatPanel.classList.contains('open');
  chatPanel.classList.toggle('open', open);
  if (open) {
    chatBadge.style.display = 'none';
    if (!chatHist.length && !greeted) {
      greeted = true;
      const g = 'سلام! من پشتیبان نوین‌شاپم 🤖 سوالی درباره خرید، تخفیف یا ارسال داری؟';
      chatHist.push({ t: g, w: 'bot' }); addMsg(g, 'bot'); saveChat();
    }
    chatBody.scrollTop = chatBody.scrollHeight;
    setTimeout(() => $('#chatInput')?.focus(), 100);
  }
}
$('#chatBtn').onclick = () => toggleChat();
$('#chatClose').onclick = () => toggleChat(false);
$('#chatForm').onsubmit = e => { e.preventDefault(); sendChat($('#chatInput').value); };
$$('#chatPanel .quick button').forEach(b => b.onclick = () => sendChat(b.textContent));
renderHist();
if (!chatHist.length) { chatBadge.textContent = '۱'; }
else chatBadge.style.display = 'none';
