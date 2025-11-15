// script.js - complete cart & bundle logic

let cart = [];
let totalPrice = 0;

// --- PRODUCT DEFINITIES ---
const products = {
  "dul": { name: "Dul Dul Dul", price: 40, type: "single" },
  "tualetti": { name: "Spaghetti Tualetti", price: 30, type: "single" },
  "chic1": { name: "Chicleteira Bicicleteira", price: 20, type: "single" },
  "chic2": { name: "Chicleteira Bicicleteira", price: 20, type: "single" },
  "grande": { name: "La Grande Combinacion", price: 10, type: "single" },
  "bundle1": { name: "Bundle 1", price: 95, type: "bundle" },
  "bundle2": { name: "Bundle 2", price: 45, type: "bundle" },
  "bundle3": { name: "Bundle 3", price: 45, type: "bundle" }
};

// --- ADD TO CART ---
function addToCart(id) {
  if (cart.find(i => i.id === id)) {
    alert(`${products[id].name} is already in your cart.`);
    return;
  }

  // exclusivity logic for bundles
  if (id === "bundle1") {
    // disable all singles and bundles
    ["dul","tualetti","chic1","chic2","grande","bundle2","bundle3"].forEach(disableBtn);
  }
  if (id === "bundle2") {
    // disable dul + chicleteira + bundle1 + bundle3
    ["dul","chic1","chic2","bundle1","bundle3"].forEach(disableBtn);
  }
  if (id === "bundle3") {
    // disable la grande, chicleteira, tualetti + bundle1 + bundle2
    ["grande","chic1","chic2","tualetti","bundle1","bundle2"].forEach(disableBtn);
  }

  // exclusivity logic for single items affecting bundles
  if (id === "dul") disableBtn("bundle1","bundle2");
  if (id === "tualetti") disableBtn("bundle1","bundle3");
  if (id === "grande") disableBtn("bundle1","bundle3");
  if (id === "chic2") disableBtn("bundle1","bundle2","bundle3"); // second chicleteira sold disables all bundles

  cart.push({ id, ...products[id] });
  totalPrice += products[id].price;
  updateCart();
  showNotification(`${products[id].name} added to cart`);
  // disable button
  disableBtn(id);
}

// --- REMOVE FROM CART ---
function removeFromCart(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  totalPrice -= cart[idx].price;
  cart.splice(idx,1);
  updateCart();

  // re-enable buttons
  Object.keys(products).forEach(prodId => {
    const btn = document.getElementById(`add-${prodId}`);
    if (btn && !cart.find(c => c.id === prodId)) {
      btn.disabled = false;
      btn.textContent = 'Add to cart';
      btn.classList.remove('sold-out');
    }
  });

  recalcExclusives();
}

// --- UPDATE CART DISPLAY ---
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  cartItems.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span>${item.name}</span>
      <span>£${item.price.toFixed(2)}</span>
      <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
    `;
    cartItems.appendChild(li);
  });
  if(cartTotal) cartTotal.textContent = `Total: £${totalPrice.toFixed(2)}`;
}

// --- NOTIFICATION ---
function showNotification(msg) {
  const notif = document.getElementById("cart-notification");
  if(!notif) return;
  notif.textContent = msg;
  notif.classList.add("show");
  setTimeout(()=>notif.classList.remove("show"),1500);
}

// --- DISABLE BUTTON ---
function disableBtn(id) {
  const btn = document.getElementById(`add-${id}`);
  if(!btn) return;
  btn.disabled = true;
  btn.textContent = "Sold out";
  btn.classList.add("sold-out");
}

// --- RECALCULATE EXCLUSIVES AFTER REMOVE ---
function recalcExclusives() {
  // reset all sold-out buttons first
  Object.keys(products).forEach(prodId => {
    const btn = document.getElementById(`add-${prodId}`);
    if(btn && !cart.find(c=>c.id===prodId)) {
      btn.disabled = false;
      btn.textContent = "Add to cart";
      btn.classList.remove("sold-out");
    }
  });

  // reapply exclusivity based on current cart
  cart.forEach(item=>{
    if(item.id==="bundle1") ["dul","tualetti","chic1","chic2","grande","bundle2","bundle3"].forEach(disableBtn);
    if(item.id==="bundle2") ["dul","chic1","chic2","bundle1","bundle3"].forEach(disableBtn);
    if(item.id==="bundle3") ["grande","chic1","chic2","tualetti","bundle1","bundle2"].forEach(disableBtn);
    if(item.id==="dul") disableBtn("bundle1","bundle2");
    if(item.id==="tualetti") disableBtn("bundle1","bundle3");
    if(item.id==="grande") disableBtn("bundle1","bundle3");
    if(item.id==="chic2") disableBtn("bundle1","bundle2","bundle3");
  });
}

// --- CHECKOUT MODAL ---
function checkout() {
  if(cart.length===0){ alert("Your cart is empty!"); return; }
  const modal=document.getElementById("checkoutModal");
  const list=document.getElementById("checkout-items");
  const total=document.getElementById("checkout-total");
  list.innerHTML="";
  cart.forEach(i=>{
    const li=document.createElement("li");
    li.textContent=`${i.name} — £${i.price.toFixed(2)}`;
    list.appendChild(li);
  });
  total.textContent=`Total: £${totalPrice.toFixed(2)}`;
  modal.style.display="flex";
}

// --- CLOSE MODALS ---
function closeCheckout() {
  const modal=document.getElementById("checkoutModal");
  modal.style.display="none";
}
function closePost() {
  const modal=document.getElementById("postModal");
  modal.style.display="none";
}

// --- PAYPAL PAYMENT ---
function proceedToPayPal() {
  if(cart.length===0){ alert("Your cart is empty!"); closeCheckout(); return; }
  const form=document.createElement("form");
  form.action="https://www.paypal.com/cgi-bin/webscr";
  form.method="post";
  form.target="_blank";
  form.appendChild(hiddenInput("cmd","_xclick"));
  form.appendChild(hiddenInput("business","s.mooij2011@gmail.com"));
  form.appendChild(hiddenInput("item_name",cart.map(i=>i.name).join(", ")));
  form.appendChild(hiddenInput("amount",totalPrice.toFixed(2)));
  form.appendChild(hiddenInput("currency_code","GBP"));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  closeCheckout();
  showPostPurchase();
}

// --- HELPERS ---
function hiddenInput(name,value){
  const inp=document.createElement("input");
  inp.type="hidden";
  inp.name=name;
  inp.value=value;
  return inp;
}

// --- POST PURCHASE MODAL ---
function showPostPurchase(){
  const modal=document.getElementById("postModal");
  modal.style.display="flex";
  cart=[];
  totalPrice=0;
  updateCart();
  // reset all buttons
  Object.keys(products).forEach(id=>{
    const btn=document.getElementById(`add-${id}`);
    if(btn){ btn.disabled=false; btn.textContent="Add to cart"; btn.classList.remove("sold-out"); }
  });
}

// --- CLOSE MODAL CLICK OUTSIDE ---
window.addEventListener("click",function(e){
  const checkout=document.getElementById("checkoutModal");
  const post=document.getElementById("postModal");
  if(e.target===checkout) closeCheckout();
  if(e.target===post) closePost();
});
