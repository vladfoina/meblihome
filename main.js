/* --- 1. ФУНКЦІЯ СПЛИВАЮЧОГО ПОВІДОМЛЕННЯ (TOAST) --- */
function showToast(message) {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast toast--success';
  toast.innerHTML = `<span>🛒</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* --- 2. УПРАВЛІННЯ КОШИКОМ ТА ЛІЧИЛЬНИКАМИ --- */
function initCartLogic() {
  // Оновлення кількості у шапці з localStorage
  function updateCartHeaderCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-btn span');
    if (cartBadge) {
      cartBadge.textContent = totalCount;
    }
  }

  // Обробка кнопок "+" та "-" на сторінці товару
  const qtyInputs = document.querySelectorAll('.quantity-counter');
  qtyInputs.forEach(counter => {
    const minusBtn = counter.querySelector('.qty-btn:first-child');
    const plusBtn = counter.querySelector('.qty-btn:last-child');
    const input = counter.querySelector('input');

    if (minusBtn && plusBtn && input) {
      minusBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });

      plusBtn.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        if (val < 99) input.value = val + 1;
      });
    }
  });

  // Кліки по кнопках "Додати в кошик"
  const addToCartBtns = document.querySelectorAll('.product-actions .btn, .product-card .btn');

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Якщо це звичайне посилання "Детальніше" — пропускаємо
      if (btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;

      e.preventDefault();

      const titleEl = document.querySelector('.product-title') || btn.closest('.product-card')?.querySelector('h3');
      const priceEl = document.querySelector('.price-current') || btn.closest('.product-card')?.querySelector('.price');
      const qtyInput = document.querySelector('.quantity-counter input');

      const title = titleEl ? titleEl.textContent.trim() : 'Товар';
      const price = priceEl ? parseInt(priceEl.textContent.replace(/\D/g, '')) || 0 : 0;
      const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

      // Збереження в localStorage
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find(item => item.title === title);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ title, price, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartHeaderCount();

      // Показати повідомлення в контейнері замість alert
      showToast(`"${title}" (${quantity} шт.) додано до кошика!`);
    });
  });

  updateCartHeaderCount();
}

/* --- 3. ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ КАТАЛОГУ --- */
function initCatalogLogic() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sort-select');

  function getPrice(card) {
    const priceEl = card.querySelector('.price, .price-current');
    if (!priceEl) return 0;
    return parseInt(priceEl.textContent.replace(/\s+/g, '').replace(/\D/g, '')) || 0;
  }

  function getName(card) {
    const titleEl = card.querySelector('h3, .product-card__title');
    return titleEl ? titleEl.textContent.trim() : '';
  }

  function applyFiltersAndSort() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const filterValue = activeBtn ? (activeBtn.getAttribute('data-filter') || 'all').toLowerCase() : 'all';
    const sortValue = sortSelect ? sortSelect.value : 'default';

    cards.forEach(card => {
      const tagEl = card.querySelector('.category-tag');
      const tagText = tagEl ? tagEl.textContent.toLowerCase() : '';

      if (filterValue === 'all' || tagText.includes(filterValue)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    const visibleCards = cards.filter(card => card.style.display !== 'none');

    visibleCards.sort((a, b) => {
      if (sortValue === 'price-asc') return getPrice(a) - getPrice(b);
      if (sortValue === 'price-desc') return getPrice(b) - getPrice(a);
      if (sortValue === 'name-asc') return getName(a).localeCompare(getName(b), 'uk');
      return 0;
    });

    visibleCards.forEach(card => grid.appendChild(card));
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.tagName === 'A') return;

      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFiltersAndSort();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFiltersAndSort);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  if (categoryParam) {
    const decodedCategory = decodeURIComponent(categoryParam).toLowerCase();
    const targetBtn = Array.from(filterBtns).find(btn => {
      const filterAttr = btn.getAttribute('data-filter');
      return filterAttr && filterAttr.toLowerCase() === decodedCategory;
    });

    if (targetBtn) {
      filterBtns.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');
    }
  }

  applyFiltersAndSort();
}

/* --- 4. ФОРМА КОНТАКТІВ --- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      formMessage.className = 'form-message form-message--success';
      formMessage.textContent = 'Дякуємо! Ваше повідомлення успішно надіслано. Ми зв’яжемося з вами найближчим часом.';
      formMessage.style.display = 'block';

      contactForm.reset();

      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    });
  }
}

/* --- ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM --- */
function main() {
  initCartLogic();
  initCatalogLogic();
  initContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
/* --- РЕНДЕР СТОРІНКИ КОШИКА --- */
function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const cartWrapper = document.getElementById('cart-wrapper');
  const cartEmpty = document.getElementById('cart-empty');
  const totalPriceEl = document.getElementById('cart-total-price');
  const totalCountEl = document.getElementById('cart-total-count');

  if (!container) return; // Якщо ми не на сторінці cart.html — виходимо

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    if (cartWrapper) cartWrapper.style.display = 'none';
    if (cartEmpty) cartEmpty.style.display = 'block';
    return;
  }

  if (cartWrapper) cartWrapper.style.display = 'grid';
  if (cartEmpty) cartEmpty.style.display = 'none';

  container.innerHTML = '';
  let totalPrice = 0;
  let totalCount = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    totalCount += item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item__info">
        <h4>${item.title}</h4>
        <div class="cart-item__price">${item.price.toLocaleString()} грн × ${item.quantity} шт. = <strong>${itemTotal.toLocaleString()} грн</strong></div>
      </div>
      <div class="cart-item__actions">
        <button class="remove-btn" data-index="${index}" title="Видалити">🗑️</button>
      </div>
    `;

    container.appendChild(itemEl);
  });

  if (totalPriceEl) totalPriceEl.textContent = `${totalPrice.toLocaleString()} грн`;
  if (totalCountEl) totalCountEl.textContent = `${totalCount} шт.`;

  // Обробка видалення елемента з кошика
  const removeBtns = container.querySelectorAll('.remove-btn');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      cart.splice(idx, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCartPage();
      
      // Оновлюємо бейдж кількості у шапці
      const cartBadge = document.querySelector('.cart-btn span');
      if (cartBadge) {
        const newCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = newCount;
      }
    });
  });
}

/* Онови функцію main() у кінець main.js, додавши туди виклик renderCartPage(): */
function main() {
  initCartLogic();
  initCatalogLogic();
  initContactForm();
  renderCartPage(); // <--- Додано цей рядок
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}