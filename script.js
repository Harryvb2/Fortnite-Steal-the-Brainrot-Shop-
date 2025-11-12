let cart = [];
let totalPrice = 0;

// Add to cart
function addToCart(id, name, price) {
  if(cart.find(i=>i.id===id)){
    showNotification(name + " is already in your cart.");
    return;
  }
  cart.push({id,name,price});
  totalPrice += price;
  updateCart();
  const btn = document.querySelector("#prod-"+id+" .add-btn");
  if(btn){ btn.disabled=true; btn.textContent="Added"; btn.classList.add("disabled"); }
  const sold = document.querySelector("#prod-"+id+" .sold-out");
  if(sold){ sold.style.display="block"; }
  showNotification(name + " added to cart!");
}

function removeFromCart(id){
  const index = cart.findIndex(i=>i.id===id);
  if(index===-1) return;
  totalPrice -= cart[index].price;
  cart.splice(index,1);
  updateCart();
  const btn = document.querySelector("#prod-"+id+" .add-btn");
  if(btn){ btn.disabled=false; btn.textContent="Add to cart"; btn.classList.remove("disabled"); }
  const sold = document.querySelector("#prod-"+id+" .sold-out");
  if(sold){ sold.style.display="none"; }
}

function updateCart(){
  const ul = document.getElementById("cart-items");
  if(!ul) return;
  ul.innerHTML="";
  cart.forEach(item=>{
    const li = document.createElement("li");
    li.className="cart-item";
    li.innerHTML=`${item.name} - £${item.price.toFixed(2)} <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>`;
    ul.appendChild(li);
  });
}

// Notification
function showNotification(msg){
  const notif = document.getElementById("cart-notification");
  notif.textContent=msg;
  notif.classList.add("show");
  setTimeout(()=>notif.classList.remove("show"),1800);
}

// Checkout modal
function checkout(){
  if(cart.length===0){ alert("Cart is empty!"); return; }
  const modal=document.getElementById("checkoutModal");
  const ul=document.getElementById("checkout-items");
  ul.innerHTML="";
  cart.forEach(item=>{
    const li=document.createElement("li");
    li.textContent=`${item.name} - £${item.price.toFixed(2)}`;
    ul.appendChild(li);
  });
  document.getElementById("checkout-total").textContent="Total: £"+totalPrice.toFixed(2);
  modal.style.display="flex"; modal.setAttribute("aria-hidden","false");
}

function closeCheckout(){
  const modal=document.getElementById("checkoutModal");
  modal.style.display="none"; modal.setAttribute("aria-hidden","true");
}

function proceedToPay(method){
  if(cart.length===0){ alert("Cart is empty!"); closeCheckout(); return; }
  const form=document.createElement("form");
  form.method="post"; form.target="_blank";
  if(method==="paypal"){
    form.action="https://www.paypal.com/cgi-bin/webscr";
    form.appendChild(hiddenInput("cmd","_xclick"));
    form.appendChild(hiddenInput("business","s.mooij2011@gmail.com"));
    form.appendChild(hiddenInput("item_name",cart.map(i=>i.name).join(", ")));
    form.appendChild(hiddenInput("amount",totalPrice.toFixed(2)));
    form.appendChild(hiddenInput("currency_code","GBP"));
  } else if(method==="credit"){
    // Credit card via PayPal checkout
    form.action="https://www.paypal.com/cgi-bin/webscr";
    form.appendChild(hiddenInput("cmd","_xclick"));
    form.appendChild(hiddenInput("business","s.mooij2011@gmail.com"));
    form.appendChild(hiddenInput("item_name",cart.map(i=>i.name).join(", ")));
    form.appendChild(hiddenInput("amount",totalPrice.toFixed(2)));
    form.appendChild(hiddenInput("currency_code","GBP"));
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  closeCheckout();
  showPostPurchase();
}

// Helper
function hiddenInput(name,value){
  const i=document.createElement("input");
  i.type="hidden"; i.name=name; i.value=value;
  return i;
}

// Post purchase modal
function showPostPurchase(){
  const modal=document.getElementById("postModal");
  modal.style.display="flex"; modal.setAttribute("aria-hidden","false");
  cart=[]; totalPrice=0; updateCart();
  document.querySelectorAll(".add-btn").forEach(b=>{ b.disabled=false; b.textContent="Add to cart"; b.classList.remove("disabled"); });
}

function closePost(){
  const modal=document.getElementById("postModal");
  modal.style.display="none"; modal.setAttribute("aria-hidden","true");
}

// Close modal on outside click
window.addEventListener("click",e=>{
  const checkout=document.getElementById("checkoutModal");
  const post=document.getElementById("postModal");
  if(e.target===checkout) closeCheckout();
  if(e.target===post) closePost();
});


