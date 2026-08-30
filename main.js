document.addEventListener('DOMContentLoaded', () => {

  /* 1. БЕЗПЕЧНИЙ МЕНЕДЖЕР КОШИКА */
  const Cart = {
    isAvailable() {
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    getItems() {
      if (!this.isAvailable()) return this.fallbackCart || [];
      return JSON.parse(localStorage.getItem('mebli_cart')) || [];
    },

    saveItems(items) {
      if (this.isAvailable()) {
        localStorage.setItem('mebli_cart', JSON.stringify(items));
      } else {
        this.fallbackCart = items;
      }
      this.updateBadge();
      renderCartPage();
    },

    add(product) {
      const items = this.getItems();
      const existingItem = items.find(item => item.id === product.id && item.color === product.color && item.size === product.size);

      if (existingItem) {
        existingItem.quantity += product.quantity;
      } else {
        items.push(product);
      }

      this.saveItems(items);
      alert(`Товар "${product.name}" додано до кошика!`);
    },

    remove(index) {
      const items = this.getItems();
      items.splice(index, 1);
      this.saveItems(items);
    },

    updateQuantity(index, newQty) {
      const items = this.getItems();
      if (newQty <= 0) {
        this.remove(index);
      } else {
        items[index].quantity = newQty;
        this.saveItems(items);
      }
    },

    updateBadge() {
      const badges = document.querySelectorAll('.cart-btn span');
      const items = this.getItems();
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      badges.forEach(badge => badge.textContent = totalCount);
    }
  };

  Cart.fallbackCart = [];
  Cart.updateBadge();

  /* 2. РЕНДЕРИНГ СТОРІНКИ КОШИКА */
  function renderCartPage() {
    const cartContainer = document.getElementById('cart-content');
    if (!cartContainer) return;

    const items = Cart.getItems();

    if (items.length === 0) {
      cartContainer.innerHTML = `
        <div class="cart-empty">
          <p>Ваш кошик порожній 🛒</p>
          <a href="catalog.html" class="btn">Перейти до каталогу</a>
        </div>
      `;
      return;
    }

    let totalPrice = 0;
    let rowsHtml = items.map((item, index) => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;

      return `
        <tr>
          <td>
            <div class="cart-item__title">${item.name}</div>
            <div class="cart-item__meta">Колір: ${item.color} | Розмір: ${item.size}</div>
          </td>
          <td>${item.price.toLocaleString('uk-UA')} грн</td>
          <td>
            <div class="quantity-counter">
              <button type="button" class="qty-btn" data-action="decrease" data-index="${index}">-</button>
              <input type="number" value="${item.quantity}" readonly>
              <button type="button" class="qty-btn" data-action="increase" data-index="${index}">+</button>
            </div>
          </td>
          <td><strong>${itemTotal.toLocaleString('uk-UA')} грн</strong></td>
          <td>
            <button class="btn-remove" data-index="${index}" title="Видалити">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    cartContainer.innerHTML = `
      <div class="cart-table-wrapper">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Ціна</th>
              <th>Кількість</th>
              <th>Сума</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <div class="cart-summary">
        <div class="cart-total">Всього: <span>${totalPrice.toLocaleString('uk-UA')} грн</span></div>
        <button class="btn btn--lg" onclick="alert('Дякуємо за замовлення!')">Оформити замовлення</button>
      </div>
    `;

    cartContainer.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        Cart.remove(index);
      });
    });

    cartContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        const action = btn.getAttribute('data-action');
        const currentQty = items[index].quantity;

        if (action === 'increase') {
          Cart.updateQuantity(index, currentQty + 1);
        } else if (action === 'decrease') {
          Cart.updateQuantity(index, currentQty - 1);
        }
      });
    });
  }

  renderCartPage();

  /* 3. ІНТЕРАКТИВ НА СТОРІНКАХ ТОВАРІВ */
  const productSection = document.querySelector('.product-detail');
  
  if (productSection) {
    const mainImg = document.querySelector('.product-gallery__main');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        thumbs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const bgUrl = getComputedStyle(this).backgroundImage;
        if (mainImg) mainImg.style.backgroundImage = bgUrl;
      });
    });

    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        colorBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    const qtyInput = document.querySelector('.quantity-counter input');
    const qtyBtns = document.querySelectorAll('.qty-btn');

    qtyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!qtyInput) return;
        let currentVal = parseInt(qtyInput.value) || 1;
        
        if (btn.textContent.trim() === '+') {
          currentVal++;
        } else if (btn.textContent.trim() === '-' && currentVal > 1) {
          currentVal--;
        }
        qtyInput.value = currentVal;
      });
    });

    const addToCartBtn = document.querySelector('.product-actions .btn--lg');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const activeColorBtn = document.querySelector('.color-btn.active');
        const sizeSelect = document.getElementById('size-select');
        const titleEl = document.querySelector('.product-title');
        const priceEl = document.querySelector('.price-current');
        const rawPrice = priceEl ? priceEl.textContent.replace(/\D/g, '') : '0';

        Cart.add({
          id: titleEl ? titleEl.textContent.trim().toLowerCase().replace(/\s+/g, '-') : 'prod',
          name: titleEl ? titleEl.textContent.trim() : 'Товар',
          price: parseInt(rawPrice) || 0,
          color: activeColorBtn ? (activeColorBtn.getAttribute('title') || 'Обраний колір') : 'Стандарт',
          size: sizeSelect ? sizeSelect.value : 'Стандарт',
          quantity: qtyInput ? (parseInt(qtyInput.value) || 1) : 1
        });
      });
    }
  }
// Зміна головного фото при кліку на мініатюри (thumbs)
    const mainImg = document.querySelector('.product-gallery__main');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        thumbs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const bgUrl = getComputedStyle(this).backgroundImage;
        if (mainImg) mainImg.style.backgroundImage = bgUrl;
      });
    });

    // ⬇️ ЗМІНА КОЛЬОРУ ТА ФОТО ТОВАРУ ПРИ КЛІКУ НА КНОПКИ КОЛЬОРУ ⬇️
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 1. Перемикаємо активний клас для кнопки
        colorBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 2. Змінюємо фото товару, якщо вказано атрибут data-img
        const newImgUrl = this.getAttribute('data-img');
        if (newImgUrl && mainImg) {
          mainImg.style.backgroundImage = `url('${newImgUrl}')`;
        }
      });
    });
});