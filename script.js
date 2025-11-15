// script.js - volledige cart & bundles logica

let cart = [];
let totalPrice = 0;

// --- Producten en bundles info ---
const products = {
  dul: {name:"Dul Dul Dul (NEON)", price:40},
  tualetti: {name:"Spaghetti Tualetti (LIGHTNING TRAIT)", price:30},
  chic1: {name:"Chicleteira Bicicleteira (HALLOWEEN)", price:20},
  chic2: {name:"Chicleteira Bicicleteira (HALLOWEEN)", price:20},
  grande: {name:"La Grande Combinacion (HALLOWEEN)", price:10},
  bundle1: {name:"Bundle 1", price:95},
  bundle2: {name:"Bundle 2", price:45},
  bundle3: {name:"Bundle 3", price:45},
};

// --- Add to cart ---
function addToCart(id) {
  // check if already in cart
  if(cart.find(i => i.id === id)) return;

  // exclusivity logic
  // bundles remove certain items or other bundles
  if(id === "bundle1") {
    ["dul","tualetti","chic1","chic2","grande","bundle2","bundle3"].forEach(disableBtn);
  } else if(id === "bundle2") {
    disableBtn("dul","chic1","chic2"); // only disables these items
  } else if(id === "bundle3") {
    disableBtn("la_grande","chic1","chic2","tualetti"); // adjust id names to match buttons
    disableBtn("bundle1"); // bundle1 cannot be bought with bundle3
  } else {
    // individual products
    if(id === "dul") disableBtn("bundle1","bundle2");
    if(id === "tualetti") disableBtn("bundle1","bundle3");
    if(id === "grande") disableBtn("bundle1","bundle3");
    if(id === "chic1" || id==="chic2") {
      disableBtn("bundle1","bundle2","bundle3");
    }
  }

  // add to cart
  cart.push({id, ...products[id]});
  totalPrice += products[id].price;
  updateCart();

  // disable button
  const btn = document.getElementById(`add-${id}`);
  if(btn){
    btn.disabled = true;
    btn.textContent = "Sold out";
    btn.classList.add("sold-out");
  }

  showNotification(`${products[id].name} added to cart!`);
}

// --- Remove from cart ---
function removeFromCart(id){
  const index = cart.findIndex(i => i.id === id);
  if(index === -1) return;
  totalPrice -= cart[index].price;
  cart.splice(index,1);
  updateCart();

  // re-enable button if not sold out by exclusivity
  const btn = document.getElementById(`add-${id}`);
  if(btn){
    btn.disabled = false;
    btn.textContent = "Add to cart";
    btn.classList.remove("sold-out");
  }

  // optional: reset other items/bundles if exclusivity was applied
  resetExclusivity();
}

// --- Update cart UI ---
function updateCart(){
  const list = document.getElementById("cart-items");
  const total = document.getElementById("cart-total");
  if(!list) return;
  list.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.className="cart-item";
    li.innerHTML = `<span>${item.name}</span><span>£${item.price}</span><button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>`;
    list.appendChild(li);
  });
  if(total) total.textContent = `Total: £${totalPrice}`;
}

// --- Disable buttons helper ---
function disableBtn(id){
  const btn = document.getElementById(`add-${id}`);
  if(btn){
    btn.disabled = true;
    btn.textContent = "Sold out";
    btn.classList.add("sold-out");
  }
}

// --- Reset exclusivity after removing items ---
function resetExclusivity(){
  // re-enable all buttons not in cart
  Object.keys(products).forEach(id => {
    const inCart = cart.find(i => i.id === id);
    const btn = document.getElementById(`add-${id}`);
    if(!inCart && btn){
      btn.disabled = false;
      btn.textContent = "Add to cart";
      btn.classList.remove("sold-out");
    }
  });

  // re-apply exclusivity for bundles based on current cart
  cart.forEach(item => {
    const id = item.id;
    if(id === "bundle1"){
      ["dul","tualetti","chic1","chic2","grande","bundle2","bundle3"].forEach(disableBtn);
    } else if(id === "bundle2"){
      disableBtn("dul","chic1","chic2");
    } else if(id === "bundle3"){
      disableBtn("grande","chic1","chic2","tualetti");
      disableBtn("bundle1");
    } else {
      if(id === "dul") disableBtn("bundle1","bundle2");
      if(id === "tualetti") disableBtn("bundle1","bundle3");
      if(id === "grande") disableBtn("bundle1","bundle3");
      if(id === "chic1" || id==="chic2") disableBtn("bundle1","bundle2","bundle3");
    }
  });
}

// --- Checkout modal ---
function checkout(){
  if(cart.length===0){ alert("Cart is empty!"); return; }
  const modal = document.getElementById("checkoutModal");
  const itemsList = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  itemsList.innerHTML="";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — £${item.price}`;
    itemsList.appendChild(li);
  });
  totalEl.textContent = `Total: £${totalPrice.toFixed(2)}`;

  modal.style.display="flex";
}

// --- Close checkout ---
function closeCheckout(){
  const modal = document.getElementById("checkoutModal");
  modal.style.display="none";
}

// --- Proceed to PayPal ---
function proceedToPayPal(){
  if(cart.length===0) { alert("Cart empty"); return; }

  const form = document.createElement("form");
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

// --- Helper for hidden inputs ---
function hiddenInput(name,value){
  const input = document.createElement("input");
  input.type="hidden";
  input.name=name;
  input.value=value;
  return input;
}

// --- Post purchase modal ---
function showPostPurchase(){
  const modal = document.getElementById("postModal");
  modal.style.display="flex";

  cart=[]; totalPrice=0;
  updateCart();

  // re-enable all buttons
  Object.keys(products).forEach(id=>{
    const btn = document.getElementById(`add-${id}`);
    if(btn){
      btn.disabled=false;
      btn.textContent="Add to cart";
      btn.classList.remove("sold-out");
    }
  });
}

function closePost(){
  const modal = document.getElementById("postModal");
  modal.style.display="none";
}

// --- Notification ---
function showNotification(message){
  const notif = document.getElementById("cart-notification");
  if(!notif) return;
  notif.textContent = message;
  notif.classList.add("show");
  setTimeout(()=>{notif.classList.remove("show");},2000);
}

// --- Close modals on outside click ---
window.addEventListener("click",e=>{
  const checkout = document.getElementById("checkoutModal");
  const post = document.getElementById("postModal");
  if(e.target===checkout) closeCheckout();
  if(e.target===post) closePost();
});
