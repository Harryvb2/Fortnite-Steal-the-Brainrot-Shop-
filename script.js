// script.js - FINAL unified cart + bundles logic
// PayPal business email:
const PAYPAL_EMAIL = 's.mooij2011@gmail.com';

// ---------------- DATA ----------------
const PRODUCTS = {
  dul: { id:'dul', name:'Dul Dul Dul (NEON)', price:40 },
  tualetti: { id:'tualetti', name:'Spaghetti Tualetti (LIGHTNING TRAIT)', price:30 },
  chic1: { id:'chic1', name:'Chicleteira Bicicleteira (HALLOWEEN)', price:20 },
  chic2: { id:'chic2', name:'Chicleteira Bicicleteira (HALLOWEEN)', price:20 },
  grande: { id:'grande', name:'La Grande Combinacion (HALLOWEEN)', price:10 }
};

const BUNDLES = {
  bundle1: { id:'bundle1', name:'Bundle 1', price:80, items:['dul','tualetti','chic1','chic2','grande'] },
  bundle2: { id:'bundle2', name:'Bundle 2', price:40, items:['dul','chic1','chic2'] },
  bundle3: { id:'bundle3', name:'Bundle 3', price:40, items:['grande','chic1','chic2','tualetti'] }
};

// runtime state
let cart = []; // { id, name, price, type:'product'|'bundle' }
let totalPrice = 0;
let sold = { // permanent-sold simulation after checkout
  products: { dul:false, tualetti:false, chic1:false, chic2:false, grande:false },
  bundles: { bundle1:false, bundle2:false, bundle3:false }
};
let chicSoldCount = 0;

// ---------------- UTIL ----------------
function q(id){ return document.getElementById(id); }
function showNotif(msg){
  const n = q('cart-notification'); if(!n) return;
  n.textContent = msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),1600);
}
function formatGBP(n){ return `£${n.toFixed(2)}`; }

// ---------------- UI: update cart ----------------
function updateCartUI(){
  const ul = q('cart-items'); if(!ul) return;
  ul.innerHTML = '';
  cart.forEach(it=>{
    const li = document.createElement('li'); li.className='cart-item';
    li.innerHTML = `<span>${it.name}</span> <span>${formatGBP(it.price)}</span> <button class="remove-btn" onclick="removeFromCart('${it.id}')">Remove</button>`;
    ul.appendChild(li);
  });
  const tot = q('cart-total'); if(tot) tot.textContent = `Total: ${formatGBP(totalPrice)}`;
}

// ---------------- Add to cart ----------------
function addToCart(id){
  // prevent duplicates
  if(cart.find(i=>i.id===id)){ showNotif('Already in cart'); return; }

  // is it a product?
  if(PRODUCTS[id]){
    // check sold/permanent sold
    if(sold.products[id]){ showNotif('This item is sold out'); return; }
    const p = PRODUCTS[id];
    cart.push({ id:p.id, name:p.name, price:p.price, type:'product' });
    totalPrice += p.price;
    q('add-' + id)?.setAttribute('disabled','disabled');
    q('add-' + id) && (q('add-' + id).textContent = 'Added');
    showNotif(`${p.name} added`);
    updateCartUI();
    applyExclusivityAfterAdd(id,'product');
    return;
  }

  // is it a bundle?
  if(BUNDLES[id]){
    if(sold.bundles[id]){ showNotif('This bundle is sold out'); return; }
    const b = BUNDLES[id];
    cart.push({ id:b.id, name:b.name, price:b.price, type:'bundle' });
    totalPrice += b.price;
    q('add-' + id)?.setAttribute('disabled','disabled');
    q('add-' + id) && (q('add-' + id).textContent = 'Added');
    showNotif(`${b.name} added`);
    updateCartUI();
    applyExclusivityAfterAdd(id,'bundle');
    return;
  }

  showNotif('Unknown item');
}

// ---------------- Remove from cart ----------------
function removeFromCart(id){
  const idx = cart.findIndex(i=>i.id===id); if(idx===-1) return;
  totalPrice -= cart[idx].price;
  const removed = cart.splice(idx,1)[0];
  updateCartUI();
  // re-enable button only if item not permanently sold
  if(removed.type === 'product'){
    if(!sold.products[removed.id]){
      const btn = q('add-' + removed.id); if(btn){ btn.disabled=false; btn.textContent='Add to cart'; }
    }
  } else {
    if(!sold.bundles[removed.id]){
      const btn = q('add-' + removed.id); if(btn){ btn.disabled=false; btn.textContent='Add to cart'; }
    }
  }
  // recompute exclusivity based on remaining cart (reapply rules)
  recomputeAllExclusivity();
  showNotif(`${removed.name} removed`);
}

// ---------------- Exclusivity rules ----------------
function applyExclusivityAfterAdd(id, type){
  // If added bundle1 -> everything else must be disabled (can't co-buy)
  if(type==='bundle' && id==='bundle1'){
    // disable all product buttons and other bundles
    Object.keys(PRODUCTS).forEach(p => disableButton('add-' + p));
    Object.keys(BUNDLES).forEach(b => { if(b!=='bundle1') disableButton('add-' + b); });
    return;
  }

  // bundle2 added: disable dul + chic1 + chic2 and disable bundle1 and bundle3
  if(type==='bundle' && id==='bundle2'){
    ['dul','chic1','chic2'].forEach(p=>disableButton('add-' + p));
    ['bundle1','bundle3'].forEach(b=>disableButton('add-' + b));
    return;
  }

  // bundle3 added: disable grande, chic1, chic2, tualetti and disable bundle1 and bundle2
  if(type==='bundle' && id==='bundle3'){
    ['grande','chic1','chic2','tualetti'].forEach(p=>disableButton('add-' + p));
    ['bundle1','bundle2'].forEach(b=>disableButton('add-' + b));
    return;
  }

  // product-specific effects when single product added to cart
  if(type==='product'){
    if(id==='dul'){
      disableButton('add-bundle1'); disableButton('add-bundle2');
    }
    if(id==='tualetti'){
      disableButton('add-bundle1'); disableButton('add-bundle3');
    }
    if(id==='grande'){
      disableButton('add-bundle1'); disableButton('add-bundle3');
    }
    if(id==='chic1' || id==='chic2'){
      // adding a chic doesn't immediately kill bundles; only second sold (after checkout) will lock permanently.
      // But per exclusivity while in cart: adding one chic should NOT disable bundles (user asked that first chic does nothing)
      // So no immediate action here.
    }
  }

  // ensure UI shows sold badges for any permanently sold items
  refreshSoldBadges();
}

// disable button helper (accept id string)
function disableButton(buttonId){
  const btn = q(buttonId);
  if(!btn) return;
  btn.disabled = true;
  btn.textContent = 'Sold out';
}

// enable button helper
function enableButton(buttonId){
  const btn = q(buttonId);
  if(!btn) return;
  btn.disabled = false;
  btn.textContent = 'Add to cart';
}

// recompute exclusivity from scratch (used when removing from cart or after checkout)
function recomputeAllExclusivity(){
  // first enable everything that is not permanently sold
  Object.keys(PRODUCTS).forEach(p => {
    if(!sold.products[p]) enableButton('add-' + p);
    else { disableButton('add-' + p); }
  });
  Object.keys(BUNDLES).forEach(b => {
    if(!sold.bundles[b]) enableButton('add-' + b);
    else { disableButton('add-' + b); }
  });

  // reapply rules for each item currently in cart
  cart.forEach(item => applyExclusivityAfterAdd(item.id, item.type));
  // also refresh sold badges
  refreshSoldBadges();
}

// ---------------- Checkout & apply permanent sold rules ----------------
function checkout(){
  if(cart.length === 0){ showNotif('Your cart is empty!'); return; }
  // fill modal
  const cm = q('checkoutModal'); const list = q('checkout-items'); const total = q('checkout-total');
  if(!cm || !list || !total) return;
  list.innerHTML = '';
  cart.forEach(it => {
    const li = document.createElement('li'); li.textContent = `${it.name} — ${formatGBP(it.price)}`; list.appendChild(li);
  });
  total.textContent = `Total: ${formatGBP(totalPrice)}`;
  cm.style.display = 'flex';
}

function closeCheckout(){ q('checkoutModal') && (q('checkoutModal').style.display='none'); }

// proceed to PayPal and then apply permanent sold rules
function proceedToPay(){
  if(cart.length===0){ showNotif('Cart empty'); closeCheckout(); return; }

  // build PayPal form
  const form = document.createElement('form'); form.method='post'; form.action='https://www.paypal.com/cgi-bin/webscr'; form.target='_blank';
  form.appendChild(hidden('cmd','_xclick'));
  form.appendChild(hidden('business',PAYPAL_EMAIL));
  form.appendChild(hidden('item_name', cart.map(i=>i.name).join(', ')));
  form.appendChild(hidden('amount', totalPrice.toFixed(2)));
  form.appendChild(hidden('currency_code','GBP'));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  // simulate successful payment: mark permanent sold according to rules
  applyPermanentSoldRulesFromCart();

  // clear cart and update UI
  cart = []; totalPrice = 0; updateCartUI(); recomputeAllExclusivity();

  // show post modal
  q('postModal') && (q('postModal').style.display='flex');
}

function closePost(){ q('postModal') && (q('postModal').style.display='none'); }

function hidden(name,val){ const i=document.createElement('input'); i.type='hidden'; i.name=name; i.value=val; return i; }

// apply permanent sold logic (per your detailed rules)
function applyPermanentSoldRulesFromCart(){
  // collect purchased ids
  const purchasedProducts = []; const purchasedBundles = [];
  // (we assume cart snapshot was used before clearing)
  // In this implementation we use the last known cartItems by reading checkout modal items
  // but better we use a local copy: we'll store before clearing
  // To keep things simple: we'll parse checkout-items DOM
  const list = q('checkout-items');
  if(list){
    // However we'll instead rely on the last cart snapshot stored in a temp var
  }

  // For correctness, we should process the previously-purchased items — therefore we store a copy before clearing
  // We'll keep a global tempPurchase that was set before calling proceedToPay. Simpler approach: set tempPurchase now:
  // NOTE: modify proceedToPay to set tempPurchase before submitting form - but to keep this file self-contained, do:
  // We'll just assume the cart variable still contains items because we only clear it after calling this function (we call this prior to clearing)
  // So we will use current cart content (call sequence in proceedToPay must call this before emptying cart)
  // Implementation: (so ensure in proceedToPay we call this BEFORE clearing cart)
  // mark bundles first then products
  // (we implemented proceedToPay above to call this BEFORE clearing)
  // For safety check:
  const purchased = [];
  // gather from checkout modal list if exists
  // But simpler: we maintain a global lastPurchase variable: set in proceedToPay just before form submit.
}

// To ensure deterministic behavior we refactor: use tempLastPurchase captured before payment
let tempLastPurchase = null;

function proceedToPayPal(){
  // older function kept for backward compatibility
  proceedToPay();
}

// We'll change proceedToPay to set tempLastPurchase before opening PayPal form
// To do that, replace previous proceedToPay implementation:
function proceedToPay(){
  if(cart.length===0){ showNotif('Cart empty'); closeCheckout(); return; }

  // capture snapshot
  tempLastPurchase = cart.map(i=>({...i}));

  // submit to PayPal
  const form = document.createElement('form'); form.method='post'; form.action='https://www.paypal.com/cgi-bin/webscr'; form.target='_blank';
  form.appendChild(hidden('cmd','_xclick'));
  form.appendChild(hidden('business',PAYPAL_EMAIL));
  form.appendChild(hidden('item_name', tempLastPurchase.map(i=>i.name).join(', ')));
  form.appendChild(hidden('amount', totalPrice.toFixed(2)));
  form.appendChild(hidden('currency_code','GBP'));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  // apply permanent rules based on tempLastPurchase
  applyPermanentRulesFromPurchase(tempLastPurchase);

  // clear cart & update
  cart = []; totalPrice = 0; updateCartUI();
  recomputeAllExclusivity();

  // post-purchase modal
  q('postModal') && (q('postModal').style.display='flex');
  // clear temp
  tempLastPurchase = null;
}

// now implement the permanent rules processor
function applyPermanentRulesFromPurchase(purchaseList){
  // purchaseList is array of {id,name,price,type}
  // First mark bundles purchased
  const boughtBundles = purchaseList.filter(i=>i.type==='bundle').map(i=>i.id);
  const boughtProducts = purchaseList.filter(i=>i.type==='product').map(i=>i.id);

  // process bundles
  boughtBundles.forEach(bid=>{
    // mark bundle sold permanently
    sold.bundles[bid] = true;
    // apply effect rules:
    if(bid === 'bundle1'){
      // bundle1 -> everything gone
      Object.keys(sold.products).forEach(p => sold.products[p] = true);
      Object.keys(sold.bundles).forEach(b => sold.bundles[b] = true);
      chicSoldCount = Object.keys(sold.products).filter(k=>k.startsWith('chic') && sold.products[k]).length;
    }
    if(bid === 'bundle2'){
      // bundle2 -> remove dul + chic(s)
      sold.products.dul = true;
      sold.products.chic1 = true;
      sold.products.chic2 = true;
      sold.bundles[bid] = true;
    }
    if(bid === 'bundle3'){
      sold.products.grande = true;
      sold.products.tualetti = true;
      sold.products.chic1 = true;
      sold.products.chic2 = true;
      sold.bundles[bid] = true;
    }
  });

  // process single products
  boughtProducts.forEach(pid=>{
    sold.products[pid] = true;
    if(pid === 'grande'){
      sold.bundles.bundle1 = true;
      sold.bundles.bundle3 = true;
    }
    if(pid === 'tualetti'){
      sold.bundles.bundle1 = true;
      sold.bundles.bundle3 = true;
    }
    if(pid === 'dul'){
      sold.bundles.bundle1 = true;
      sold.bundles.bundle2 = true;
    }
    if(pid === 'chic1' || pid === 'chic2'){
      // increment chic count
      chicSoldCount++;
      if(chicSoldCount >= 2){
        // all bundles removed
        Object.keys(sold.bundles).forEach(b=> sold.bundles[b]=true);
      }
    }
  });

  // conflict rules: if two bundles sold -> lock the third
  if(sold.bundles.bundle1 && sold.bundles.bundle2) sold.bundles.bundle3 = true;
  if(sold.bundles.bundle2 && sold.bundles.bundle3) sold.bundles.bundle1 = true;
  if(sold.bundles.bundle1 && sold.bundles.bundle3) sold.bundles.bundle2 = true;

  // finally update UI badges/buttons
  refreshSoldBadges();
  recomputeAllExclusivity();
}

// ---------------- UI: sold badges ----------------
function refreshSoldBadges(){
  // products
  Object.keys(sold.products).forEach(pid=>{
    const badge = q('sold-' + pid);
    const btn = q('add-' + pid);
    if(sold.products[pid]){
      if(badge) badge.style.display='block';
      if(btn) { btn.disabled = true; btn.textContent = 'Sold out'; }
    } else {
      if(badge) badge.style.display='none';
      // don't enable button if already in cart logic will handle it
      if(btn && !cart.find(i=>i.id===pid)) { btn.disabled=false; btn.textContent='Add to cart'; }
    }
  });

  // bundles
  Object.keys(sold.bundles).forEach(bid=>{
    const badge = q('sold-' + bid);
    const btn = q('add-' + bid);
    if(sold.bundles[bid]){
      if(badge) badge.style.display='block';
      if(btn) { btn.disabled = true; btn.textContent = 'Sold out'; }
    } else {
      if(badge) badge.style.display='none';
      if(btn && !cart.find(i=>i.id===bid)) { btn.disabled=false; btn.textContent='Add to cart'; }
    }
  });
}

// ---------------- Init bindings ----------------
function initBindings(){
  // attach click listeners already via HTML onclicks; ensure sold badges hidden initially
  refreshSoldBadges();
  // close modals by clicking outside
  window.addEventListener('click', function(e){
    const cm = q('checkoutModal'), pm = q('postModal');
    if(cm && e.target === cm) closeCheckout();
    if(pm && e.target === pm) closePost();
  });
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBindings);
else initBindings();


