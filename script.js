let cart = [];
let totalPrice = 0;

function addToCart(id,name,price){
  const exists = cart.find(i=>i.id===id);
  if(exists){
    showNotification(name+" is already in cart");
    return;
  }
  cart.push({id,name,price});
  totalPrice += price;
  updateCart();
  const btn = document.getElementById("add-"+id);
  if(btn){ btn.disabled=true; btn.textContent="Added"; document.querySelector("#prod-"+id+" .sold-out").style.display="inline-block"; }
  showNotification(name+" added to cart!");
}

function removeFromCart(id){
  const idx = cart.findIndex(i=>i.id===id);
  if(idx===-1) return;
  totalPrice -= cart[idx].price;
  cart.splice(idx,1);
  updateCart();
  const btn = document.getElementById("add-"+id);
  if(btn){ btn.disabled=false; btn.textContent="Add to cart"; document.querySelector("#prod-"+id+" .sold-out").style.display="none"; }
}

function updateCart(){
  const list = document.getElementById("cart-items");
  const total = document.getElementById("cart-total");
  if(!list || !total) return;
  list.innerHTML="";
  cart.forEach(item=>{
    const li=document.createElement("li");
    li.className="cart-item";
    li.innerHTML=`<span>${item.name}</span><span>£${item.price.toFixed(2)}</span> <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>`;
    list.appendChild(li);
  });
  total.textContent=totalPrice.toFixed(2);
}

// Checkout modal
function checkout(){
  if(cart.length===0){ showNotification("Cart is empty!"); return; }
  const modal=document.getElementById("checkoutModal");
  const list=document.getElementById("checkout-items");
  const total=document.getElementById("checkout-total");
  list.innerHTML="";
  cart.forEach(item=>{
    const li=document.createElement("li");
    li.textContent=`${item.name} — £${item.price.toFixed(2)}`;
    list.appendChild(li);
  });
  total.textContent="Total: £"+totalPrice.toFixed(2);
  modal.style.display="flex";
  modal.setAttribute("aria-hidden","false");
}

function closeCheckout(){
  const modal=document.getElementById("checkoutModal");
  modal.style.display="none";
  modal.setAttribute("aria-hidden","true");
}

// PayPal
function proceedToPayPal(){
  if(cart.length===0){ closeCheckout(); return; }
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

function hiddenInput(name,value){
  const el=document.createElement("input");
  el.type="hidden"; el.name=name; el.value=value;
  return el;
}

// Post purchase
function showPostPurchase(){
  const modal=document.getElementById("postModal");
  modal.style.display="flex"; modal.setAttribute("aria-hidden","false");
  cart=[]; totalPrice=0; updateCart();
  document.querySelectorAll(".add-btn").forEach(b=>{ b.disabled=false; b.textContent="Add to cart"; document.querySelector("#"+b.id.replace("add-","prod-")+" .sold-out").style.display="none"; });
}

function closePost(){
  const modal=document.getElementById("postModal");
  modal.style.display="none"; modal.setAttribute("aria-hidden","true");
}

// Notification
function showNotification(msg){
  let notif=document.querySelector(".cart-notification");
  if(!notif){
    notif=document.createElement("div"); notif.className="cart-notification"; document.body.appendChild(notif);
  }
  notif.textContent=msg; notif.classList.add("show");
  setTimeout(()=>notif.classList.remove("show"),1800);
}

// Close modals by clicking outside
window.addEventListener("click",e=>{
  const checkoutModal=document.getElementById("checkoutModal");
  const postModal=document.getElementById("postModal");
  if(e.target===checkoutModal) closeCheckout();
  if(e.target===postModal) closePost();
});

