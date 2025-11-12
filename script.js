// script.js - clean, reliable cart + checkout + sold-out logic

// Runtime state
let cart = [];
let totalPrice = 0;

// Persisted bought products: { id: true, ... }
const boughtProducts = JSON.parse(localStorage.getItem('bought')) || {};

// Utility: show small top-center notification
function showNotification(msg, type = 'info') {
  const n = document.createElement('div');
  n.className = `cart-notification ${type}`;
  n.textContent = msg;
  document.body.appendChild(n);
  // trigger show
  requestAnimationFrame(() => n.classList.add('show'));
  // remove after 2.4s
  setTimeout(() => n.classList.remove('show'), 2300);
  setTimeout(() => n.remove(), 2600);
}

// Initialize buttons / sold-out UI on every page load
function initProducts(ids = ['dul','tualetti','chic1','chic2','grande']) {
  ids.forEach(id => {
    const addBtn = document.getElementById('add-' + id);
    const card = document.getElementById('card-' + id);
    if (boughtProducts[id]) {
      // mark sold out
      if (addBtn) { addBtn.disabled = true; addBtn.textContent = 'Sold Out'; addBtn.classList.add('disabled'); }
      if (card) {
        const sold = card.querySelector('.sold-out');
        if (sold) sold.style.display = 'inline-block';
      }
    } else {
      // ensure default state
      if (addBtn) { addBtn.disabled = false; addBtn.textContent = 'Add to Cart'; addBtn.classList.remove('disabled'); }
      if (card) {
        const sold = card.querySelector('.sold-out');
        if (sold) sold.style.display = 'none';
      }
    }
  });

  // If cart-items UL is present on page, refresh it (in case of reload)
  updateCartUI();
}

// Add product to cart (pre-check sold + duplicates)
function addToCart(id, name, price) {
  if (boughtProducts[id]) {
    showNotification('This product is sold out.', 'error');
    return;
  }
  // duplicate check
  if (cart.some(i => i.id === id)) {
    showNotification('Already in cart', 'info');
    return;
  }

  cart.push({ id, name, price });
  totalPrice += price;
  // update add button
  const btn = document.getElementById('add-' + id);
  if (btn) { btn.disabled = true; btn.textContent = 'Added'; btn.classList.add('disabled'); }

  updateCartUI();
  showNotification(`${name} added to cart!`, 'success');
}

// Remove product from cart
function removeFromCart(id) {
  const index = cart.findIndex(i => i.id === id);
  if (index === -1) return;
  totalPrice -= cart[index].price;
  cart.splice(index, 1);

  // re-enable add button only if not bought
  if (!boughtProducts[id]) {
    const btn = document.getElementById('add-' + id);
    if (btn) { btn.disabled = false; btn.textContent = 'Add to Cart'; btn.classList.remove('disabled'); }
  }
  updateCartUI();
  showNotification('Item removed from cart.', 'info');
}

// Update cart UI wherever #cart-items or #cart-total exists
function updateCartUI() {
  const cartList = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (cartList) {
    cartList.innerHTML = '';
    if (cart.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-cart';
      li.textContent = 'Your cart is empty.';
      cartList.appendChild(li);
    } else {
      cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <span class="cart-name">${item.name}</span>
          <span class="cart-price">£${item.price.toFixed(2)}</span>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartList.appendChild(li);
      });
    }
  }
  if (cartTotal) cartTotal.textContent = `Total: £${totalPrice.toFixed(2)}`;
}

// Checkout: open review modal (fills #checkout-items and #checkout-total)
function checkout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty.', 'error');
    return;
  }
  const modal = document.getElementById('checkoutModal');
  const itemsEl = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  if (!modal || !itemsEl || !totalEl) {
    showNotification('Checkout UI missing on this page.', 'error');
    return;
  }

  itemsEl.innerHTML = '';
  cart.forEach(i => {
    const li = document.createElement('li');
    li.textContent = `${i.name} — £${i.price.toFixed(2)}`;
    itemsEl.appendChild(li);
  });
  totalEl.textContent = `Total: £${totalPrice.toFixed(2)}`;

  modal.style.display = 'flex';
}

// Close checkout modal
function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.style.display = 'none';
}

// Proceed to PayPal: submit form, then mark items as bought
function proceedToPayPal() {
  if (cart.length === 0) {
    showNotification('Your cart is empty.', 'error');
    closeCheckout();
    return;
  }

  // Build PayPal form and submit in new tab
  const form = document.createElement('form');
  form.action = 'https://www.paypal.com/cgi-bin/webscr';
  form.method = 'post';
  form.target = '_blank';

  form.appendChild(hiddenInput('cmd', '_xclick'));
  form.appendChild(hiddenInput('business', 's.mooij2011@gmail.com'));
  form.appendChild(hiddenInput('item_name', cart.map(i => i.name).join(', ')));
  form.appendChild(hiddenInput('amount', totalPrice.toFixed(2)));
  form.appendChild(hiddenInput('currency_code', 'GBP'));

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  // After opening PayPal: mark items as bought and persist
  cart.forEach(i => { boughtProducts[i.id] = true; });
  localStorage.setItem('bought', JSON.stringify(boughtProducts));

  // Clear cart state
  cart = [];
  totalPrice = 0;
  updateCartUI();

  // Refresh product buttons + sold-out UI
  refreshProductUI();

  closeCheckout();
  showPostPurchaseModal();
}

// helper to create hidden inputs
function hiddenInput(name, value) {
  const el = document.createElement('input');
  el.type = 'hidden';
  el.name = name;
  el.value = value;
  return el;
}

// Post-purchase modal (simple)
function showPostPurchaseModal() {
  const modal = document.getElementById('postModal');
  if (!modal) {
    showNotification('Thank you! Open a Discord ticket to claim your items.', 'success');
    return;
  }
  modal.style.display = 'flex';
}

// close post modal
function closePost() {
  const modal = document.getElementById('postModal');
  if (modal) modal.style.display = 'none';
}

// Refresh product cards/buttons according to boughtProducts
function refreshProductUI(ids = ['dul','tualetti','chic1','chic2','grande']) {
  ids.forEach(id => {
    const btn = document.getElementById('add-' + id);
    const card = document.getElementById('card-' + id);
    if (boughtProducts[id]) {
      if (btn) { btn.disabled = true; btn.textContent = 'Sold Out'; btn.classList.add('disabled'); }
      if (card) {
        const sold = card.querySelector('.sold-out');
        if (sold) sold.style.display = 'inline-block';
      }
    } else {
      // if not bought, ensure default (don't re-enable if in cart - addToCart handles that)
      if (card) {
        const sold = card.querySelector('.sold-out');
        if (sold) sold.style.display = 'none';
      }
      // Note: don't enable add button here if it's in cart - leave as is
    }
  });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  const checkoutModal = document.getElementById('checkoutModal');
  const postModal = document.getElementById('postModal');
  if (checkoutModal && e.target === checkoutModal) closeCheckout();
  if (postModal && e.target === postModal) closePost();
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initProducts();
  refreshProductUI();
  updateCartUI();
});
