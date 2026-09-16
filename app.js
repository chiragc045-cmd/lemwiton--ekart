let ps=[],cart=[];

const productImages={
 P001:"images/product-shampoo.jpg",
 P002:"images/product-hair-serum.jpg",
 P003:"images/product-bhringraj-oil.jpg",
 P004:"images/product-amla-oil.jpg",
 P005:"images/product-ubtan-pack.jpg",
 P006:"images/product-anti-hair-fall.jpg",
 P007:"images/product-ubtan-soap.jpg",
 P008:"images/product-kesuda-soap.jpg"
};

async function load(){
  ps=await(await fetch("/api/products")).json();
  render();
}

function render(){
  let q=(document.getElementById('search').value||'').toLowerCase(),c=document.getElementById('cat').value;
  let list=ps.filter(p=>(c==="all"||p.category===c)&&p.name.toLowerCase().includes(q));
  document.getElementById('result').textContent=list.length+" Products";
  document.getElementById('grid').innerHTML=list.map(p=>`<article><div class="photo"><img src="${productImages[p.id]||''}" alt="${p.name}" loading="lazy"></div><h3>${p.name}</h3><small>${p.size} • ${p.category}</small><strong>₹${p.price}</strong><button onclick="add('${p.id}')">Add to Cart</button></article>`).join("");
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

function add(id){let x=cart.find(a=>a.productId===id);x?x.qty++:cart.push({productId:id,qty:1});draw();openCart()}
function ch(id,n){let x=cart.find(a=>a.productId===id);x.qty+=n;if(x.qty<1)cart=cart.filter(a=>a.productId!==id);draw()}
function draw(){
  document.getElementById('count').textContent=cart.reduce((s,x)=>s+x.qty,0);
  document.getElementById('items').innerHTML=cart.length?cart.map(x=>{let p=ps.find(y=>y.id===x.productId);return `<div class="row"><b>${p.name}</b><br>₹${p.price} × ${x.qty}<div><button onclick="ch('${p.id}',-1)">−</button><button onclick="ch('${p.id}',1)">+</button></div></div>`}).join(""):"Cart is empty.";
  document.getElementById('total').textContent="₹"+cart.reduce((s,x)=>s+ps.find(p=>p.id===x.productId).price*x.qty,0)
}
function openCart(){drawer.classList.add("show");shade.classList.add("show")}
function closeCart(){drawer.classList.remove("show");shade.classList.remove("show")}
function closeModal(){modal.classList.remove("show")}
function checkout(){
  if(!cart.length)return alert("Add a product first");
  closeCart();
  view.innerHTML=`<h2>Checkout</h2><form id="cf"><input name="name" required placeholder="Full Name"><input name="phone" required pattern="[0-9]{10}" placeholder="Mobile Number"><input name="email" type="email" placeholder="Email (optional)"><input name="address" required placeholder="Delivery Address"><input name="city" required placeholder="City"><input name="state" required value="Gujarat" placeholder="State"><input name="pin" required pattern="[0-9]{6}" placeholder="PIN Code"><select name="paymentMethod"><option value="COD">Cash on Delivery</option><option value="ONLINE">Online Payment</option></select><div class="summary">Total: <b>₹${cart.reduce((s,x)=>s+ps.find(p=>p.id===x.productId).price*x.qty,0)}</b></div><button>Place Order</button></form>`;
  modal.classList.add("show");cf.onsubmit=placeOrder
}
async function placeOrder(e){
  e.preventDefault();let customer=Object.fromEntries(new FormData(e.target));
  let r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart,paymentMethod:customer.paymentMethod})}),d=await r.json();
  if(!r.ok)return alert(d.error);
  view.innerHTML=`<div class="success">✓<h2>Order Created</h2><p>Order ID: <b>${d.orderId}</b></p><p>Total: ₹${d.total}</p>${d.payment?`<p>Razorpay Order: ${d.payment.orderId}<br><small>Checkout UI activates after live Razorpay keys are configured.</small></p>`:""}<button onclick="closeModal()">Continue Shopping</button></div>`;cart=[];draw()
}
load();
