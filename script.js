let cart = [];
let totalPrice = 0;

// Voeg product toe
function addToCart(id, name, price){
    const exists = cart.find(item => item.id === id);
    if(exists){
        alert(`${name} is already in your cart.`);
        return;
    }
    cart.push({id,name,price});
    totalPrice += price;
    updateCart();

    const btn = document.getElementById('add-'+id);
    if(btn){
        btn.disabled = true;
        btn.textContent = 'Added';
        btn.classList.add('disabled');
    }
}

// Verwijder product
function removeFromCart(id){
    const index = cart.findIndex(item => item.id === id);
    if(index === -1) return;
    totalPrice -= cart[index].price;
    cart.splice(index,1);
    updateCart();

    const btn = document.getElementById('add-'+id);
    if(btn){
        btn.disabled = false;
        btn.textContent = 'Add to cart';
        btn.classList.remove('disabled');
    }
}

// Update winkelmand
function updateCart(){
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartList.innerHTML = '';
    cart.forEach(item=>{
        const li = document.createElement('li');
        li.className='cart-item';
        li.innerHTML=`<span class="cart-name">${item.name}</span>
        <span class="cart-price">£${item.price}</span>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>`;
        cartList.appendChild(li);
    });
    cartTotal.textContent=`Total: £${totalPrice}`;
}



