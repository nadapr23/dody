// ---------- صفحة "هل تحبني؟" ----------
const home = document.getElementById("home");
const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");

const heartScreen = document.getElementById("heartScreen");
const backBtn = document.getElementById("backBtn");

const btnRow = document.querySelector(".btn-row");

function moveNoButton() {
  const rowRect = btnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const padding = 8;

  const minX = padding;
  const maxX = rowRect.width - btnRect.width - padding;
  const minY = padding;
  const maxY = rowRect.height - btnRect.height - padding;

  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.right = "auto";
  noBtn.style.transform = "none";
}

requestAnimationFrame(() => {
  noBtn.style.left = "60%";
  noBtn.style.top  = "40px";
  noBtn.style.right = "auto";
  noBtn.style.transform = "none";
});

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("mousemove", moveNoButton);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); }, {passive:false});
noBtn.addEventListener("click", (e) => { e.preventDefault(); moveNoButton(); });

// ---------- الانتقال للقلب ----------
yesBtn.addEventListener("click", () => {
  home.classList.add("hidden");
  heartScreen.classList.remove("hidden");
  startHeart();
});

backBtn.addEventListener("click", () => {
  stopHeart();
  heartScreen.classList.add("hidden");
  home.classList.remove("hidden");
});

// ---------- قلب ينرسم + كلمات بكل الشاشة ----------
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let rafId = null;
let t = 0;
let drawProgress = 0;      // من 0 إلى 1 (يرسم القلب تدريجيًا)
let points = [];

// كلمات طايرة بالخلفية
let floaters = [];

function rand(min, max){ return Math.random() * (max - min) + min; }

function resizeCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width  = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function heartPoint(a){
  // معادلة قلب
  const x = 16 * Math.pow(Math.sin(a), 3);
  const y = 13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a);
  return {x, y};
}

function buildHeartPoints(){
  points = [];
  const N = 520; // كثافة نقاط
  for (let i = 0; i < N; i++){
    const a = (i / N) * Math.PI * 2;
    points.push(heartPoint(a));
  }
}

function buildFloaters(){
  const W = window.innerWidth;
  const H = window.innerHeight;

  floaters = [];
  const count = Math.floor((W * H) / 20000); // كثافة الكلمات حسب حجم الشاشة

  for(let i=0;i<count;i++){
    floaters.push({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.25, 0.25),
      size: rand(12, 22),
      a: rand(0.05, 0.16),   // شفافية خفيفة
      wob: rand(0.6, 1.4),
      phase: rand(0, Math.PI*2)
    });
  }
}

window.addEventListener("resize", () => {
  resizeCanvas();
  buildHeartPoints();
  buildFloaters();
});

function fadeBg(){
  // أثر حركة ناعم
  ctx.fillStyle = "rgba(5,5,10,0.18)";
  ctx.fillRect(0,0,window.innerWidth, window.innerHeight);
}

// كلمة خفيفة للخلفية
function drawSoftText(x, y, size, alpha){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(255, 180, 225, 1)";
  ctx.shadowColor = "rgba(255,77,166,0.30)";
  ctx.shadowBlur = 10;
  ctx.font = `${size}px system-ui, -apple-system, Segoe UI, Tahoma, Arial`;
  ctx.fillText("I love you", x, y);
  ctx.restore();
}

function updateFloaters(){
  const W = window.innerWidth;
  const H = window.innerHeight;

  for(const f of floaters){
    f.phase += 0.012 * f.wob;

    f.x += f.vx + Math.sin(f.phase) * 0.18;
    f.y += f.vy + Math.cos(f.phase) * 0.14;

    // لف من الأطراف
    if(f.x < -80) f.x = W + 80;
    if(f.x > W + 80) f.x = -80;
    if(f.y < -50) f.y = H + 50;
    if(f.y > H + 50) f.y = -50;

    const a = f.a + 0.03 * Math.sin(f.phase * 2 + t);
    drawSoftText(f.x, f.y, f.size, a);
  }
}

// كلمة للقلب (أوضح)
function drawWord(x, y, alpha){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(255,77,166,0.9)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "rgba(255, 170, 220, 0.95)";
  ctx.font = "16px system-ui, -apple-system, Segoe UI, Tahoma, Arial";
  ctx.fillText("I love you", x, y);
  ctx.restore();
}


function startHeart(){
  resizeCanvas();
  buildHeartPoints();
  buildFloaters();

  ctx.fillStyle = "#05050a";
  ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

  t = 0;
  drawProgress = 0;
  loop();
}

function stopHeart(){
  if(rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

function loop(){
  rafId = requestAnimationFrame(loop);
  fadeBg();

  // 1) كلمات خفيفة بكل الشاشة تتحرك
  updateFloaters();

  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W * 0.5;
  const cy = H * 0.5;

  const baseScale = Math.min(W, H) * 0.018;

  // 2) تقدم الرسم أبطأ (كان 0.012)
  drawProgress = Math.min(1, drawProgress + 0.004);

  // نبض خفيف يبدأ بعد ما يقرب يكتمل
  const beatStrength = Math.max(0, (drawProgress - 0.6) / 0.4);
  const beat = 1 + 0.06 * Math.sin(t * 2.2) * beatStrength;

  // حركة بسيطة
  const driftX = 6 * Math.sin(t * 0.7);
  const driftY = 5 * Math.cos(t * 0.6);

  const total = points.length;
  const visibleCount = Math.floor(total * drawProgress);

  // ارسم القلب وهو ينرسم تدريجيًا
  for(let i=0; i<visibleCount; i++){
    const p = points[i];

    const x0 = p.x * baseScale * beat;
    const y0 = -p.y * baseScale * beat;

    const spread = 18;
    const r1 = (Math.sin(i*12.9898 + t*2) * 43758.5453) % 1;
    const r2 = (Math.sin(i*78.233  + t*2) * 12345.6789) % 1;

    const x = cx + x0 + driftX + (r1 - 0.5) * spread;
    const y = cy + y0 + driftY + (r2 - 0.5) * spread;

    const alpha = 0.20 + 0.55 * (0.5 + 0.5*Math.sin(t*3 + i*0.18));
    drawWord(x, y, alpha);
  }

  // لمعة خفيفة لما يكتمل
  if(drawProgress >= 1){
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.shadowColor = "rgba(255,77,166,1)";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "rgba(255,77,166,0.75)";
    ctx.beginPath();
    ctx.arc(cx + driftX, cy + driftY, 7 + 2*Math.sin(t*2.2), 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // 3) النص بالنص ثابت وخفيف

  // 4) حركة عامة أبطأ شوي (كان 0.016)
  t += 0.010;
}
