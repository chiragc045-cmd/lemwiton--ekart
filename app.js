let ps=[],cart=[];

// Header actions
function openSearch(){
  const section=document.getElementById('products');
  section?.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>document.getElementById('search')?.focus(),350);
}

const WHATSAPP_NUMBER = "";

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
}

function closeLogin(){
  const m=document.getElementById('loginModal');
  m.classList.remove('show'); m.setAttribute('aria-hidden','true');
}

function submitLogin(){
  const phone=document.getElementById('loginPhone').value.trim();
  if(!/^[0-9]{10}$/.test(phone)) return alert('Please enter a valid 10-digit mobile number.');
  alert('Login / OTP will be connected in the customer account step.');
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

    let current=0;
    let timer;

    function show(index){
      current=(index+slides.length)%slides.length;
      track.style.transform=`translateX(-${current*100}%)`;
      dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));
    }

    function start(){
      timer=setInterval(()=>show(current+1),4500);
    }

    function restart(){
      clearInterval(timer);
      start();
    }

    prev.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      show(current-1); restart();
    });

    next.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      show(current+1); restart();
    });

    dots.forEach((dot,i)=>{
      dot.addEventListener('click',e=>{
        e.preventDefault(); e.stopPropagation();
        show(i); restart();
      });
    });

    show(0);
    start();
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
    headers:{"Content-Type":"application/json"},
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
