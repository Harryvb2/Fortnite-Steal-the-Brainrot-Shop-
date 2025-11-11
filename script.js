


let cart = [];
let totalPrice = 0;

function addToCart(id, name, price) {
  const exists = cart.find(item => item.id === id);
  if (exists) {
    alert(`${name} is already in your cart!`);
    return;
  }
  cart.push({ id, name, price });
  totalPrice += price;
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (!cartItems) return;

  cartItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - £${item.price}`;
    cartItems.appendChild(li);
  });

  if (cartTotal) cartTotal.textContent = `Total: £${totalPrice}`;
}

// Checkout modal
const checkoutModal = document.getElementById('checkoutModal');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  checkoutItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - £${item.price}`;
    checkoutItems.appendChild(li);
  });

  checkoutTotal.textContent = `Total: £${totalPrice.toFixed(2)}`;
  checkoutModal.style.display = 'block';
}

function closeCheckout() {
  checkoutModal.style.display = 'none';
}

function proceedToPayPal() {
  const form = document.createElement('form');
  form.action = "https://www.paypal.com/cgi-bin/webscr";
  form.method = "post";
  form.target = "_blank";

  const cmd = document.createElement('input');
  cmd.type = "hidden";
  cmd.name = "cmd";
  cmd.value = "_xclick";
  form.appendChild(cmd);

  const business = document.createElement('input');
  business.type = "hidden";
  business.name = "business";
  business.value = "s.mooij2011@gmail.com";
  form.appendChild(business);

  const item_name = document.createElement('input');
  item_name.type = "hidden";
  item_name.name = "item_name";
  item_name.value = cart.map(i => i.name).join(", ");
  form.appendChild(item_name);

  const amount = document.createElement('input');
  amount.type = "hidden";
  amount.name = "amount";
  amount.value = totalPrice.toFixed(2);
  form.appendChild(amount);

  const currency_code = document.createElement('input');
  currency_code.type = "hidden";
  currency_code.name = "currency_code";
  currency_code.value = "GBP";
  form.appendChild(currency_code);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  closeCheckout();
}
