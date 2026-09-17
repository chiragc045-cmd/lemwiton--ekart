require("dotenv").config();
const express=require("express"),{Pool}=require("pg"),bcrypt=require("bcryptjs"),crypto=require("crypto");
const app=express();
const pool=new Pool({
  connectionString:process.env.DATABASE_URL,
  ssl:process.env.DATABASE_URL?.includes("localhost")?false:{rejectUnauthorized:false}
});
app.use(express.json());
app.use(express.static(__dirname));
const sessions=new Map();
const rp=(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET)
  ?new (require("razorpay"))({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET})
  :null;

const auth=(req,res,next)=>{
  const t=req.headers.authorization?.replace("Bearer ","");
  if(!t||!sessions.has(t))return res.status(401).json({error:"Unauthorized"});
  req.customer=sessions.get(t);
  next();
};

async function initDatabase(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins(
      id BIGSERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products(
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_paise INTEGER NOT NULL CHECK(price_paise>=0),
      size TEXT,
      category TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS customers(
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      password_hash TEXT,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders(
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      total_paise INTEGER NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items(
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price_paise INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity>0)
    );
  `);
  const products=[
    ["P001","Lemwiton Herbal Shampoo",44900,"250 ml","Hair Care"],
    ["P002","Lemwiton Fully Vital Hair Serum",35000,"15 ml","Hair Care"],
    ["P003","Lemwiton Maha Bhringraj Hair Oil",50000,"100 ml","Hair Care"],
    ["P004","Lemwiton Amla Hair Oil",30000,"100 ml","Hair Care"],
    ["P005","Lemwiton Ubtan Face Glow Pack",40000,"100 gm","Skin Care"],
    ["P006","Lemwiton Anti Hair Fall Pack",10000,"45 gm","Hair Care"],
    ["P007","Lemwiton Ubtan Soap",9900,"100 gm","Soaps"],
    ["P008","Lemwiton Kesuda Soap",9900,"100 gm","Soaps"]
  ];
  for(const p of products){
    await pool.query(
      `INSERT INTO products(id,name,price_paise,size,category)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(id) DO NOTHING`,p
    );
  }
  console.log("Database ready: tables created and 8 products seeded.");
}

app.get("/api/products",async(q,s)=>{
  try{
    let {rows}=await pool.query("SELECT id,name,price_paise,size,category FROM products WHERE active=true ORDER BY created_at");
    s.json(rows.map(x=>({...x,price:x.price_paise/100})))
  }catch(e){s.status(500).json({error:"Database error"})}
});

app.post("/api/admin/login",async(q,s)=>{
  try{
    let {username,password}=q.body,{rows}=await pool.query("SELECT * FROM admins WHERE username=$1",[username]);
    if(!rows[0]||!(await bcrypt.compare(password,rows[0].password_hash)))return s.status(401).json({error:"Invalid login"});
    let t=crypto.randomBytes(32).toString("hex");sessions.set(t,{type:"admin",id:rows[0].id,at:Date.now()});s.json({token:t})
  }catch(e){s.status(500).json({error:"Login error"})}
});

function normalizePhone(phone){
  const p=String(phone||"").replace(/\D/g,"");
  return p.length===10?"+91"+p:p.startsWith("91")?"+"+p:p.startsWith("+")?p:"";
}

app.post("/api/auth/register",async(q,s)=>{
  const name=String(q.body?.name||"").trim();
  const phone=normalizePhone(q.body?.phone);
  const email=String(q.body?.email||"").trim().toLowerCase()||null;
  const password=String(q.body?.password||"");
  if(!name)return s.status(400).json({error:"Name is required"});
  if(!phone)return s.status(400).json({error:"Enter a valid 10-digit mobile number"});
  if(password.length<6)return s.status(400).json({error:"Password must be at least 6 characters"});
  try{
    const passwordHash=await bcrypt.hash(password,12);
    const id="CU"+crypto.createHash("sha256").update(phone).digest("hex").slice(0,20).toUpperCase();
    const {rows}=await pool.query(
      `INSERT INTO customers(id,phone,name,email,password_hash,updated_at)
       VALUES($1,$2,$3,$4,$5,NOW())
       ON CONFLICT(phone) DO UPDATE SET
         name=EXCLUDED.name,email=EXCLUDED.email,password_hash=EXCLUDED.password_hash,updated_at=NOW()
       RETURNING id,phone,name,email,last_login_at,created_at`,
      [id,phone,name,email,passwordHash]
    );
    const token=crypto.randomBytes(32).toString("hex");
    sessions.set(token,{type:"customer",id:rows[0].id,phone:rows[0].phone,at:Date.now()});
    s.status(201).json({ok:true,token,customer:rows[0]});
  }catch(e){s.status(400).json({error:e.message||"Unable to create account"})}
});

app.post("/api/auth/login",async(q,s)=>{
  const phone=normalizePhone(q.body?.phone);
  const password=String(q.body?.password||"");
  if(!phone||!password)return s.status(400).json({error:"Mobile number and password are required"});
  try{
    const {rows}=await pool.query("SELECT * FROM customers WHERE phone=$1",[phone]);
    const customer=rows[0];
    if(!customer||!customer.password_hash||!(await bcrypt.compare(password,customer.password_hash)))
      return s.status(401).json({error:"Invalid mobile number or password"});
    const updated=await pool.query(
      "UPDATE customers SET last_login_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING id,phone,name,email,last_login_at,created_at",
      [customer.id]
    );
    const token=crypto.randomBytes(32).toString("hex");
    sessions.set(token,{type:"customer",id:customer.id,phone:customer.phone,at:Date.now()});
    s.json({ok:true,token,customer:updated.rows[0]});
  }catch(e){s.status(500).json({error:"Login error"})}
});

app.post("/api/auth/forgot-password",async(q,s)=>{
  const phone=normalizePhone(q.body?.phone);
  const email=String(q.body?.email||"").trim().toLowerCase();
  const newPassword=String(q.body?.newPassword||"");
  if(!phone||!email)return s.status(400).json({error:"Registered mobile number and email are required"});
  if(newPassword.length<6)return s.status(400).json({error:"Password must be at least 6 characters"});
  try{
    const {rows}=await pool.query("SELECT id FROM customers WHERE phone=$1 AND LOWER(COALESCE(email,''))=$2",[phone,email]);
    if(!rows[0])return s.status(404).json({error:"No customer account matches this mobile number and email"});
    const hash=await bcrypt.hash(newPassword,12);
    await pool.query("UPDATE customers SET password_hash=$1,updated_at=NOW() WHERE id=$2",[hash,rows[0].id]);
    s.json({ok:true});
  }catch(e){s.status(500).json({error:"Unable to reset password"})}
});

app.get("/api/auth/me",auth,async(q,s)=>{
  if(q.customer.type!=="customer")return s.status(403).json({error:"Customer login required"});
  try{
    const {rows}=await pool.query("SELECT id,phone,name,email,last_login_at,created_at FROM customers WHERE id=$1",[q.customer.id]);
    if(!rows[0])return s.status(404).json({error:"Customer not found"});
    s.json(rows[0]);
  }catch(e){s.status(500).json({error:"Database error"})}
});

app.post("/api/auth/logout",auth,(q,s)=>{
  sessions.delete(q.headers.authorization?.replace("Bearer ",""));
  s.json({ok:true});
});

app.get("/api/customers",auth,async(q,s)=>{
  if(q.customer.type!=="admin")return s.status(403).json({error:"Admin only"});
  try{
    const {rows}=await pool.query("SELECT id,phone,name,email,last_login_at,created_at FROM customers ORDER BY created_at DESC");
    s.json(rows);
  }catch(e){s.status(500).json({error:"Database error"})}
});

app.get("/api/orders",auth,async(q,s)=>{
  if(q.customer.type!=="admin")return s.status(403).json({error:"Admin only"});
  try{
    let {rows}=await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    s.json(rows.map(x=>({...x,total:x.total_paise/100})))
  }catch(e){s.status(500).json({error:"Database error"})}
});
app.patch("/api/orders/:id",auth,async(q,s)=>{
  if(q.customer.type!=="admin")return s.status(403).json({error:"Admin only"});
  let ok=["pending","confirmed","shipped","delivered","cancelled"];
  if(!ok.includes(q.body.status))return s.status(400).json({error:"Invalid status"});
  try{
    let {rows}=await pool.query("UPDATE orders SET order_status=$1,updated_at=NOW() WHERE id=$2 RETURNING id,order_status",[q.body.status,q.params.id]);
    if(!rows[0])return s.status(404).json({error:"Not found"});
    s.json(rows[0])
  }catch(e){s.status(500).json({error:"Database error"})}
});

app.post("/api/orders",async(q,s)=>{
  let {customer,items,paymentMethod="COD"}=q.body;
  if(!customer?.name||!customer?.phone||!customer?.address||!customer?.city||!customer?.state||!customer?.pin)
    return s.status(400).json({error:"Complete delivery details are required"});
  if(!items?.length)return s.status(400).json({error:"Cart is empty"});
  let c=await pool.connect();
  try{
    await c.query("BEGIN");
    let total=0,clean=[];
    for(let x of items){
      let {rows}=await c.query("SELECT id,name,price_paise FROM products WHERE id=$1 AND active=true",[x.productId]);
      let p=rows[0],qty=Math.max(1,Math.floor(Number(x.qty||1)));
      if(!p)throw Error("Invalid product");
      total+=p.price_paise*qty;clean.push({p,qty})
    }
    let id="LM"+Date.now().toString().slice(-9)+crypto.randomBytes(2).toString("hex").toUpperCase();
    await c.query(
      "INSERT INTO orders(id,customer_name,phone,email,address,city,state,pin,payment_method,payment_status,order_status,total_paise) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','pending',$10)",
      [id,customer.name,customer.phone,customer.email||null,customer.address,customer.city,customer.state,customer.pin,paymentMethod,total]
    );
    for(let x of clean)await c.query(
      "INSERT INTO order_items(order_id,product_id,product_name,unit_price_paise,quantity) VALUES($1,$2,$3,$4,$5)",
      [id,x.p.id,x.p.name,x.p.price_paise,x.qty]
    );
    const normalized=normalizePhone(customer.phone);
    if(normalized){
      await c.query(
        `INSERT INTO customers(id,phone,name,email,updated_at)
         VALUES($1,$2,$3,$4,NOW())
         ON CONFLICT(phone) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,updated_at=NOW()`,
        ["CU"+crypto.createHash("sha256").update(normalized).digest("hex").slice(0,20).toUpperCase(),normalized,customer.name,customer.email||null]
      );
    }
    let pay=null;
    if(paymentMethod==="ONLINE"){
      if(!rp)throw Error("Online payment is not configured");
      pay=await rp.orders.create({amount:total,currency:"INR",receipt:id,payment_capture:1});
      await c.query("UPDATE orders SET razorpay_order_id=$1 WHERE id=$2",[pay.id,id])
    }
    await c.query("COMMIT");
    s.status(201).json({orderId:id,total:total/100,payment:pay?{keyId:process.env.RAZORPAY_KEY_ID,orderId:pay.id,amount:total,currency:"INR"}:null})
  }catch(e){
    await c.query("ROLLBACK");s.status(400).json({error:e.message})
  }finally{c.release()}
});
app.post("/api/payments/verify",async(q,s)=>{
  let {razorpay_order_id,razorpay_payment_id,razorpay_signature}=q.body;
  if(!process.env.RAZORPAY_KEY_SECRET)return s.status(503).json({error:"Payment gateway not configured"});
  let expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id+"|"+razorpay_payment_id).digest("hex");
  if(expected!==razorpay_signature)return s.status(400).json({error:"Invalid signature"});
  try{
    let {rows}=await pool.query(
      "UPDATE orders SET payment_status='paid',order_status='confirmed',razorpay_payment_id=$1,updated_at=NOW() WHERE razorpay_order_id=$2 RETURNING id",
      [razorpay_payment_id,razorpay_order_id]
    );
    if(!rows[0])return s.status(404).json({error:"Order not found"});
    s.json({ok:true,orderId:rows[0].id})
  }catch(e){s.status(500).json({error:"Database error"})}
});
const port=process.env.PORT||3000;
initDatabase()
  .then(()=>app.listen(port,()=>console.log("Lemwiton Ekart ready on port "+port)))
  .catch(e=>{console.error("Database initialization failed:",e);process.exit(1)});
