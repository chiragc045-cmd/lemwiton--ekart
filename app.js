let ps=[],cart=[];
let customerSession=localStorage.getItem('lemwitonCustomerToken')||'';

// Header actions
function openSearch(){
  const section=document.getElementById('products');
  section?.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>document.getElementById('search')?.focus(),350);
}

const WHATSAPP_NUMBER = "919737403050";

function openWhatsApp(){
  if(WHATSAPP_NUMBER){
    window.open("https://wa.me/"+WHATSAPP_NUMBER,"_blank");
  }else{
    document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
  }
}

function openLogin(){
  const m=document.getElementById('loginModal');
  m.classList.add('show'); m.setAttribute('aria-hidden','false');
  showLoginStep();
}
function closeLogin(){
  const m=document.getElementById('loginModal');
  m.classList.remove('show'); m.setAttribute('aria-hidden','true');
}
function loginMarkup(active='login',message=''){
  return `
    <button class="login-close" onclick="closeLogin()">✕</button>
    <div class="login-icon">♙</div>
    <div class="login-tabs">
      <button type="button" class="login-tab ${active==='login'?'active':''}" onclick="showLoginStep()">Login</button>
      <button type="button" class="login-tab ${active==='signup'?'active':''}" onclick="showSignupStep()">Create Account</button>
    </div>
    ${message?`<div class="login-message">${message}</div>`:''}`;
}
function showLoginStep(){
  const box=document.querySelector('#loginModal .login-box'); if(!box)return;
  box.innerHTML=loginMarkup('login')+`
    <h2>Customer Login</h2>
    <p>Login with your registered mobile number and password.</p>
    <input id="loginPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="tel">
    <input id="loginPassword" type="password" placeholder="Password" autocomplete="current-password">
    <button class="login-submit" onclick="submitLogin()">Login</button>
    <button type="button" class="login-link" onclick="showForgotPasswordStep()">Forgot Password?</button>
    <small>Login is optional. You can also purchase directly without login.</small>`;
}
function showSignupStep(){
  const box=document.querySelector('#loginModal .login-box'); if(!box)return;
  box.innerHTML=loginMarkup('signup')+`
    <h2>Create Account</h2>
    <p>Create your Lemwiton customer account.</p>
    <input id="signupName" type="text" placeholder="Full Name" autocomplete="name">
    <input id="signupPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number" autocomplete="tel">
    <input id="signupEmail" type="email" placeholder="Email (optional)" autocomplete="email">
    <input id="signupPassword" type="password" placeholder="Create Password" autocomplete="new-password">
    <input id="signupPassword2" type="password" placeholder="Confirm Password" autocomplete="new-password">
    <button class="login-submit" onclick="submitSignup()">Create Account</button>
    <small>After creating an account, you can login anytime. No OTP is required.</small>`;
}
function showForgotPasswordStep(){
  const box=document.querySelector('#loginModal .login-box'); if(!box)return;
  box.innerHTML=`
    <button class="login-close" onclick="closeLogin()">✕</button>
    <div class="login-icon">♙</div>
    <h2>Forgot Password</h2>
    <p>Enter your registered mobile number and email, then choose a new password.</p>
    <input id="forgotPhone" type="tel" inputmode="numeric" maxlength="10" placeholder="Registered mobile number" autocomplete="tel">
    <input id="forgotEmail" type="email" placeholder="Registered email" autocomplete="email">
    <input id="forgotPassword" type="password" placeholder="New Password" autocomplete="new-password">
    <input id="forgotPassword2" type="password" placeholder="Confirm New Password" autocomplete="new-password">
    <button class="login-submit" onclick="submitForgotPassword()">Reset Password</button>
    <button type="button" class="login-link" onclick="showLoginStep()">Back to Login</button>`;
}
function validPhone(v){return /^[0-9]{10}$/.test(String(v||'').replace(/\D/g,''));}
function validPassword(v){return String(v||'').length>=6;}
async function postAuth(url,body,successMessage){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||'Please try again.');
  if(d.token){
    customerSession=d.token;
    localStorage.setItem('lemwitonCustomerToken',customerSession);
  }
  if(successMessage)alert(successMessage);
  return d;
}
async function submitLogin(){
  const phone=(document.getElementById('loginPhone')?.value||'').replace(/\D/g,'');
  const password=document.getElementById('loginPassword')?.value||'';
  if(!validPhone(phone))return alert('Please enter a valid 10-digit mobile number.');
  if(!password)return alert('Please enter your password.');
  const btn=document.querySelector('#loginModal .login-submit');
  if(btn){btn.disabled=true;btn.textContent='Logging in...';}
  try{await postAuth('/api/auth/login',{phone,password},'Login successful.');closeLogin();}
  catch(e){alert(e.message);if(btn){btn.disabled=false;btn.textContent='Login';}}
}
async function submitSignup(){
  const name=(document.getElementById('signupName')?.value||'').trim();
  const phone=(document.getElementById('signupPhone')?.value||'').replace(/\D/g,'');
  const email=(document.getElementById('signupEmail')?.value||'').trim();
  const password=document.getElementById('signupPassword')?.value||'';
  const password2=document.getElementById('signupPassword2')?.value||'';
  if(!name)return alert('Please enter your name.');
  if(!validPhone(phone))return alert('Please enter a valid 10-digit mobile number.');
  if(!validPassword(password))return alert('Password must be at least 6 characters.');
  if(password!==password2)return alert('Passwords do not match.');
  const btn=document.querySelector('#loginModal .login-submit');
  if(btn){btn.disabled=true;btn.textContent='Creating...';}
  try{await postAuth('/api/auth/register',{name,phone,email,password},'Account created successfully.');closeLogin();}
  catch(e){alert(e.message);if(btn){btn.disabled=false;btn.textContent='Create Account';}}
}
async function submitForgotPassword(){
  const phone=(document.getElementById('forgotPhone')?.value||'').replace(/\D/g,'');
  const email=(document.getElementById('forgotEmail')?.value||'').trim();
  const password=document.getElementById('forgotPassword')?.value||'';
  const password2=document.getElementById('forgotPassword2')?.value||'';
  if(!validPhone(phone))return alert('Please enter your registered 10-digit mobile number.');
  if(!email)return alert('Please enter your registered email.');
  if(!validPassword(password))return alert('Password must be at least 6 characters.');
  if(password!==password2)return alert('Passwords do not match.');
  const btn=document.querySelector('#loginModal .login-submit');
  if(btn){btn.disabled=true;btn.textContent='Resetting...';}
  try{
    await postAuth('/api/auth/forgot-password',{phone,email,newPassword:password},'Password reset successfully.');
    showLoginStep();
  }catch(e){alert(e.message);if(btn){btn.disabled=false;btn.textContent='Reset Password';}}
}

/* Main product images.
   The first image is the existing product image.
   Add the other 4 filenames when you upload alternate product photos. */
const productImages={
  P001:["product-shampoo.jpeg","product-shampoo.jpeg","product-shampoo.jpeg","product-shampoo.jpeg","product-shampoo.jpeg"],
  P002:["product-hair-serum.jpeg","product-hair-serum.jpeg","product-hair-serum.jpeg","product-hair-serum.jpeg","product-hair-serum.jpeg"],
  P003:["product-bhringraj-oil.png","product-bhringraj-oil.png","product-bhringraj-oil.png","product-bhringraj-oil.png","product-bhringraj-oil.png"],
  P004:["product-amla-oil.png","product-amla-oil.png","product-amla-oil.png","product-amla-oil.png","product-amla-oil.png"],
  P005:["product-ubtan-pack.png","product-ubtan-pack.png","product-ubtan-pack.png","product-ubtan-pack.png","product-ubtan-pack.png"],
  P006:["product-anti-hair-fall.jpeg","product-anti-hair-fall.jpeg","product-anti-hair-fall.jpeg","product-anti-hair-fall.jpeg","product-anti-hair-fall.jpeg"],
  P007:["product-ubtan-soap.jpeg","product-ubtan-soap.jpeg","product-ubtan-soap.jpeg","product-ubtan-soap.jpeg","product-ubtan-soap.jpeg"],
  P008:["product-kesuda-soap.png","product-kesuda-soap.png","product-kesuda-soap.png","product-kesuda-soap.png","product-kesuda-soap.png"]
};
async function load(){
  ps=await(await fetch("/api/products")).json();
  render();
}

function render(){
  let q=(document.getElementById('search').value||'').toLowerCase();
  let c=document.getElementById('cat').value;
  let list=ps.filter(p=>(c==="all"||p.category===c)&&p.name.toLowerCase().includes(q));

  document.getElementById('result').textContent=list.length+" Products";
  document.getElementById('grid').innerHTML=list.map(p=>{
    const imgs=productImages[p.id]||[""];
    return `
      <article>
        <div class="photo product-gallery" data-product-gallery>
          <div class="product-gallery-track">
            ${imgs.slice(0,5).map((src,i)=>`
              <div class="product-gallery-slide">
                <img src="${src}" alt="${p.name}" loading="lazy">
              </div>`).join("")}
          </div>
          <button class="product-gallery-arrow product-gallery-prev" type="button" aria-label="Previous image">‹</button>
          <button class="product-gallery-arrow product-gallery-next" type="button" aria-label="Next image">›</button>

          <div class="product-gallery-dots">
            ${imgs.slice(0,5).map((_,i)=>`
              <button class="product-gallery-dot ${i===0?'active':''}" type="button" aria-label="Image ${i+1}"></button>
            `).join("")}
          </div>
        </div>
        <h3>${p.name}</h3>
        <small>${p.size} • ${p.category}</small>
        <strong>₹${p.price}</strong>
        <button onclick="add('${p.id}')">Add to Cart</button>
      </article>
    `;
  }).join("");

  initProductGalleries();
}
function initProductGalleries(){
  document.querySelectorAll('[data-product-gallery]').forEach(gallery=>{
    const track=gallery.querySelector('.product-gallery-track');
    const slides=gallery.querySelectorAll('.product-gallery-slide');
    const dots=gallery.querySelectorAll('.product-gallery-dot');
    const prev=gallery.querySelector('.product-gallery-prev');
    const next=gallery.querySelector('.product-gallery-next');
    let current=0, startX=0, dragging=false;
    function show(index){
      current=(index+slides.length)%slides.length;
      track.style.transform=`translate3d(-${current*100}%,0,0)`;
      dots.forEach((dot,i)=>{
        dot.classList.toggle('active',i===current);
        dot.setAttribute('aria-current',i===current?'true':'false');
      });
    }
    prev.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(current-1);});
    next.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(current+1);});
    dots.forEach((dot,i)=>dot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(i);}));
    gallery.addEventListener('touchstart',e=>{
      if(e.touches.length!==1)return;
      startX=e.touches[0].clientX; dragging=true;
    },{passive:true});
    gallery.addEventListener('touchend',e=>{
      if(!dragging)return;
      dragging=false;
      const dx=e.changedTouches[0].clientX-startX;
      if(Math.abs(dx)>40) show(current+(dx<0?1:-1));
    },{passive:true});

    show(0);
  });
}

function setCategory(value){
  document.getElementById('cat').value=value;
  render();
}
function openMenu(){
  document.getElementById('sideMenu').classList.add('show');
  document.getElementById('menuShade').classList.add('show');
  document.querySelector('.menu-btn').setAttribute('aria-expanded','true');
  document.getElementById('sideMenu').setAttribute('aria-hidden','false');
}
function closeMenu(){
  document.getElementById('sideMenu').classList.remove('show');
  document.getElementById('menuShade').classList.remove('show');
  const b=document.querySelector('.menu-btn'); if(b)b.setAttribute('aria-expanded','false');
  const m=document.getElementById('sideMenu'); if(m)m.setAttribute('aria-hidden','true');
}
function toggleShop(){
  const s=document.getElementById('shopSubmenu');
  s.classList.toggle('show');
  document.getElementById('shopArrow').textContent=s.classList.contains('show')?'⌃':'⌄';
}

function add(id){
  let x=cart.find(a=>a.productId===id);
  x?x.qty++:cart.push({productId:id,qty:1});
  draw(); openCart();
}

function ch(id,n){
  let x=cart.find(a=>a.productId===id);
  x.qty+=n;
  if(x.qty<1)cart=cart.filter(a=>a.productId!==id);
  draw();
}
function draw(){
  document.getElementById('count').textContent=cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById('items').innerHTML=cart.length?
    cart.map(x=>{
      let p=ps.find(y=>y.id===x.productId);
      return `<div class="row"><b>${p.name}</b><br>₹${p.price} × ${x.qty}<div><button onclick="ch('${p.id}',-1)">−</button><button onclick="ch('${p.id}',1)">+</button></div></div>`
    }).join("")
    :"Cart is empty.";
  document.getElementById('total').textContent="₹"+cart.reduce(
    (s,x)=>s+ps.find(p=>p.id===x.productId).price*x.qty,0
  );
}

function openCart(){drawer.classList.add("show");shade.classList.add("show")}
function closeCart(){drawer.classList.remove("show");shade.classList.remove("show")}
function closeModal(){modal.classList.remove("show")}

function checkout(){
  if(!cart.length)return alert("Add a product first");
  closeCart();
  view.innerHTML=`<h2>Checkout</h2><form id="cf">
    <p style="margin:0 0 10px;color:#53635a;font-size:14px">You can purchase without login.</p>
    <input name="name" required placeholder="Full Name">
    <input name="phone" required pattern="[0-9]{10}" placeholder="Mobile Number">
    <input name="email" type="email" placeholder="Email (optional)">
    <input name="address" required placeholder="Delivery Address">
    <input name="city" required placeholder="City">
    <input name="state" required value="Gujarat" placeholder="State">
    <input name="pin" required pattern="[0-9]{6}" placeholder="PIN Code">
    <select name="paymentMethod">
      <option value="COD">Cash on Delivery</option>
      <option value="ONLINE">Online Payment</option>
    </select>
    <div class="summary">Total: <b>₹${cart.reduce((s,x)=>s+ps.find(p=>p.id===x.productId).price*x.qty,0)}</b></div>
    <button>Place Order</button>
  </form>`;
  modal.classList.add("show");
  cf.onsubmit=placeOrder;
}

async function placeOrder(e){
  e.preventDefault();
  let customer=Object.fromEntries(new FormData(e.target));

  let r=await fetch("/api/orders",{
    method:"POST",
    headers:{"Content-Type":"application/json",...(customerSession?{"Authorization":"Bearer "+customerSession}:{})},
    body:JSON.stringify({customer,items:cart,paymentMethod:customer.paymentMethod})
  });

  let d=await r.json();
  if(!r.ok)return alert(d.error);
  view.innerHTML=`<div class="success">✓
    <h2>Order Created</h2>
    <p>Order ID: <b>${d.orderId}</b></p>
    <p>Total: ₹${d.total}</p>
    ${d.payment?`<p>Razorpay Order: ${d.payment.orderId}<br><small>Checkout UI activates after live Razorpay keys are configured.</small></p>`:""}
    <button onclick="closeModal()">Continue Shopping</button>
  </div>`;

  cart=[]; draw();
}

load();
