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
  P001:["product-shampoo-slider-1.png","product-shampoo-slider-2.png","product-shampoo-slider-3.png","product-shampoo-slider-4.png","product-shampoo-slider-5.png"],
  P002:["product-hair-serum.jpeg","product-hair-serum-slider-2.png","product-hair-serum-slider-3.png","product-hair-serum-slider-4.png","product-hair-serum-slider-5.png"],
  P003:["product-bhringraj-oil-slider-1.png","product-bhringraj-oil-slider-2.png","product-bhringraj-oil-slider-3.png","product-bhringraj-oil-slider-4.png","product-bhringraj-oil-slider-5.png"],
  P004:["product-amla-oil-slider-1.png?v=20260929-amla","product-amla-oil-slider-2.png?v=20260929-amla","product-amla-oil-slider-3.png?v=20260929-amla","product-amla-oil-slider-4.png?v=20260929-amla","product-amla-oil-slider-5.png?v=20260929-amla"],
  P005:["product-ubtan-pack-v2.png","product-ubtan-pack-v3.png","product-ubtan-pack-v4.png","product-ubtan-pack-v5.png","product-ubtan-pack-v6.png"],
  P006:["product-anti-hair-fall-slider-1.png?v=20260929","product-anti-hair-fall-slider-2.png?v=20260929","product-anti-hair-fall-slider-3.png?v=20260929","product-anti-hair-fall-slider-4.png?v=20260929","product-anti-hair-fall-slider-5.png?v=20260929"],
  P007:["product-ubtan-soap-slider-1.png","product-ubtan-soap-slider-2.png","product-ubtan-soap-slider-3.png","product-ubtan-soap-slider-4.png","product-ubtan-soap-slider-5.png"],
  P008:["product-kesuda-soap.png","product-kesuda-soap-slider-2.png","product-kesuda-soap-slider-3.png","product-kesuda-soap-slider-4.png","product-kesuda-soap-slider-5.png"]
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
                <img src="${src}" alt="${p.name}" loading="lazy" data-product-image data-product-id="${p.id}" data-image-index="${i}">
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
function closeProductImagePopup(fromHistory=false){
  const popup=document.getElementById('productImagePopup');
  if(!popup)return;
  popup.remove();
  document.body.classList.remove('product-image-popup-open');
  if(!fromHistory && history.state && history.state.lemwitonProductImagePopup){
    history.back();
  }
}

function openProductImagePopup(img){
  if(!img)return;
  const productId=img.getAttribute('data-product-id')||'';
  const imageIndex=Number(img.getAttribute('data-image-index')||0);
  const product=ps.find(x=>x.id===productId);
  const imgs=(productImages[productId]||[]).slice(0,5);
  if(!imgs.length) imgs.push(img.currentSrc||img.src);

  const existing=document.getElementById('productImagePopup');
  if(existing) existing.remove();

  const popup=document.createElement('div');
  popup.id='productImagePopup';
  popup.className='product-image-popup';
  popup.setAttribute('role','dialog');
  popup.setAttribute('aria-modal','true');
  popup.innerHTML=`
    <div class="product-image-popup-backdrop"></div>
    <div class="product-image-popup-panel">
      <button type="button" class="product-image-popup-close" aria-label="Close image">✕</button>
      <div class="product-image-popup-media">
        <button type="button" class="product-image-popup-arrow product-image-popup-prev" aria-label="Previous image">‹</button>
        <img class="product-image-popup-main-image" src="${imgs[imageIndex]||imgs[0]}" alt="${product?.name||img.alt||''}">
        <button type="button" class="product-image-popup-arrow product-image-popup-next" aria-label="Next image">›</button>
      </div>
      <div class="product-image-popup-dots" aria-label="Product images">
        ${imgs.map((_,i)=>`<button type="button" class="product-image-popup-dot${i===imageIndex?' active':''}" aria-label="Image ${i+1}" aria-current="${i===imageIndex?'true':'false'}"></button>`).join('')}
      </div>
      <div class="product-image-popup-details">
        <h2>${product?.name||img.alt||''}</h2>
        ${product?.size||product?.category?`<p>${product?.size||''}${product?.size&&product?.category?' • ':''}${product?.category||''}</p>`:''}
        ${product?.price!=null?`<strong>₹${product.price}</strong>`:''}
        ${product?`<button type="button" class="product-image-popup-cart">Add to Cart</button>`:''}
      </div>
    </div>`;

  document.body.appendChild(popup);
  document.body.classList.add('product-image-popup-open');

  const media=popup.querySelector('.product-image-popup-media');
  const mainImage=popup.querySelector('.product-image-popup-main-image');
  const dots=popup.querySelectorAll('.product-image-popup-dot');
  const prev=popup.querySelector('.product-image-popup-prev');
  const next=popup.querySelector('.product-image-popup-next');
  let current=Math.min(Math.max(imageIndex,0),imgs.length-1);
  let startX=0, tracking=false;

  function showPopupImage(index){
    current=(index+imgs.length)%imgs.length;
    mainImage.src=imgs[current];
    mainImage.alt=product?.name||img.alt||'';
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active',i===current);
      dot.setAttribute('aria-current',i===current?'true':'false');
    });
  }

  prev.addEventListener('click',e=>{
    e.preventDefault(); e.stopPropagation(); showPopupImage(current-1);
  });
  next.addEventListener('click',e=>{
    e.preventDefault(); e.stopPropagation(); showPopupImage(current+1);
  });
  dots.forEach((dot,i)=>dot.addEventListener('click',e=>{
    e.preventDefault(); e.stopPropagation(); showPopupImage(i);
  }));

  media.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    startX=e.touches[0].clientX;
    tracking=true;
  },{passive:true});
  media.addEventListener('touchend',e=>{
    if(!tracking)return;
    tracking=false;
    const dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)>40) showPopupImage(current+(dx<0?1:-1));
  },{passive:true});

  const close=()=>closeProductImagePopup(false);
  popup.querySelector('.product-image-popup-close').addEventListener('click',close);
  popup.querySelector('.product-image-popup-backdrop').addEventListener('click',close);
  const cart=popup.querySelector('.product-image-popup-cart');
  if(cart) cart.addEventListener('click',()=>{ if(product) add(product.id); });

  showPopupImage(current);

  if(!(history.state && history.state.lemwitonProductImagePopup)){
    history.pushState({lemwitonProductImagePopup:true,imageIndex:current},'',location.href);
  }
}

window.addEventListener('popstate',function(){
  if(document.getElementById('productImagePopup')){
    closeProductImagePopup(true);
  }
});

function initProductImagePopupStyles(){
  if(document.getElementById('productImagePopupStyles'))return;
  const style=document.createElement('style');
  style.id='productImagePopupStyles';
  style.textContent=`
    body.product-image-popup-open{overflow:hidden;}
    .product-image-popup{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;}
    .product-image-popup-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72);}
    .product-image-popup-panel{position:relative;z-index:1;width:min(920px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:16px;box-sizing:border-box;}
    .product-image-popup-close{position:absolute;right:10px;top:10px;z-index:3;width:40px;height:40px;border:0;border-radius:50%;background:#fff;font-size:22px;line-height:40px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.18);}
    .product-image-popup-media{position:relative;text-align:center;background:#f6f5ef;border-radius:10px;overflow:hidden;}
    .product-image-popup-media img{user-select:none;-webkit-user-drag:none;touch-action:pan-y;}
    .product-image-popup-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.94);color:#174f40;font-size:32px;line-height:38px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.18);}
    .product-image-popup-prev{left:10px;}
    .product-image-popup-next{right:10px;}
    .product-image-popup-dots{display:flex;justify-content:center;align-items:center;gap:8px;padding:10px 0 2px;}
    .product-image-popup-dot{width:10px;height:10px;padding:0;border:0;border-radius:50%;background:#cfcfcf;cursor:pointer;}
    .product-image-popup-dot.active{background:#004d3c;transform:scale(1.15);}
    .product-image-popup-media img{display:block;width:100%;max-height:70vh;object-fit:contain;margin:auto;user-select:none;-webkit-user-drag:none;touch-action:pan-y;}
    .product-image-popup-details{padding:14px 4px 2px;text-align:left;}
    .product-image-popup-details h2{margin:0 0 6px;font-size:22px;}
    .product-image-popup-details p{margin:0 0 8px;color:#806b4f;}
    .product-image-popup-details strong{display:block;font-size:22px;margin-bottom:10px;}
    .product-image-popup-cart{width:100%;border:0;background:#004d3c;color:#fff;padding:13px 16px;border-radius:4px;font-size:16px;cursor:pointer;}
    @media(max-width:600px){
      .product-image-popup{padding:8px;align-items:center;}
      .product-image-popup-panel{width:100%;max-height:calc(100vh - 16px);border-radius:12px;padding:10px;}
      .product-image-popup-media img{max-height:62vh;}
      .product-image-popup-details h2{font-size:19px;}
      .product-image-popup-close{width:38px;height:38px;line-height:38px;}
    }
  `;
  document.head.appendChild(style);
}

initProductImagePopupStyles();

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

    gallery.querySelectorAll('[data-product-image]').forEach(img=>{
      img.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        openProductImagePopup(img);
      });
    });

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
  const form=e.target;
  const customer=Object.fromEntries(new FormData(form));
  const submitButton=form.querySelector('button[type="submit"],button:not([type])');
  if(submitButton){submitButton.disabled=true;submitButton.textContent=customer.paymentMethod==="ONLINE"?"Creating Payment...":"Placing Order...";}

  try{
    const r=await fetch("/api/create-order",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        ...(customerSession?{"Authorization":"Bearer "+customerSession}:{})
      },
      body:JSON.stringify({customer,items:cart,paymentMethod:customer.paymentMethod})
    });

    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"Unable to create order");

    if(customer.paymentMethod==="ONLINE"){
      if(!d.payment?.keyId||!d.payment?.orderId){
        throw new Error("Online payment is not configured. Please try again later.");
      }
      openRazorpayCheckout(d,customer);
      return;
    }

    showOrderSuccess(d);
  }catch(err){
    alert(err.message||"Something went wrong");
    if(submitButton){submitButton.disabled=false;submitButton.textContent="Place Order";}
  }
}

function showOrderSuccess(d){
  view.innerHTML=`<div class="success">✓
    <h2>Order Confirmed</h2>
    <p>Order ID: <b>${d.orderId}</b></p>
    <p>Total: ₹${d.total}</p>
    <button onclick="closeModal()">Continue Shopping</button>
  </div>`;
  cart=[];
  draw();
}

function openRazorpayCheckout(d,customer){
  if(typeof Razorpay!=="function"){
    alert("Razorpay Checkout could not be loaded. Please refresh and try again.");
    return;
  }

  const options={
    key:d.payment.keyId,
    amount:d.payment.amount,
    currency:d.payment.currency||"INR",
    name:"Lemwiton Ayurveda",
    description:"Lemwiton Ayurvedic Care",
    order_id:d.payment.orderId,
    prefill:{
      name:customer.name||"",
      email:customer.email||"",
      contact:customer.phone||""
    },
    theme:{color:"#315a45"},
    modal:{
      ondismiss:function(){
        if(document.getElementById("modal")?.classList.contains("show")){
          view.innerHTML=`<div class="success">
            <h2>Payment Cancelled</h2>
            <p>Your payment was cancelled. Your cart is still saved, so you can try again.</p>
            <button onclick="closeModal()">Back to Shopping</button>
          </div>`;
        }
      }
    },
    handler:async function(response){
      await verifyRazorpayPayment(response,d);
    }
  };

  const rzp=new Razorpay(options);

  rzp.on("payment.failed",function(response){
    const description=response?.error?.description||"Payment failed. No payment was confirmed.";
    view.innerHTML=`<div class="success">
      <h2>Payment Failed</h2>
      <p>${escapeHtml(description)}</p>
      <p>Your cart is still saved. Please try again.</p>
      <button onclick="closeModal()">Back to Shopping</button>
    </div>`;
  });

  rzp.open();
}

async function verifyRazorpayPayment(response,d){
  view.innerHTML=`<div class="success"><h2>Verifying Payment...</h2><p>Please wait while we confirm your payment.</p></div>`;

  try{
    const r=await fetch("/api/verify-payment",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        razorpay_order_id:response.razorpay_order_id,
        razorpay_payment_id:response.razorpay_payment_id,
        razorpay_signature:response.razorpay_signature
      })
    });
    const result=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(result.error||"Payment verification failed");

    showOrderSuccess(d);
  }catch(err){
    view.innerHTML=`<div class="success">
      <h2>Payment Verification Failed</h2>
      <p>${escapeHtml(err.message||"We could not verify the payment.")}</p>
      <p>Your cart is still saved. Please contact support if your bank was charged.</p>
      <button onclick="closeModal()">Close</button>
    </div>`;
  }
}

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}

load();
