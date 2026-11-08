// تعريف مصفوفة المنتجات فارغة في البداية
let products = [];

let cart = JSON.parse(localStorage.getItem('my_store_cart')) || [];

const productsGrid = document.getElementById('products-grid');
const cartCountElement = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartIcon = document.querySelector('.cart-icon');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const totalAmountElement = document.getElementById('total-amount');

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutTotalElement = document.getElementById('checkout-total');

// دالة لجلب البيانات من ملف JSON الخارجي
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('حدث خطأ أثناء تحميل المنتجات:', error);
    }
}

// عرض المنتجات الديناميكية في الصفحة
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${product.price} ج.م</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">إضافة إلى السلة</button>
        `;
        productsGrid.appendChild(card);
    });
}

// باقي الدوال الخاصة بالسلة والشراء كما هي...
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
}

function increaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('my_store_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;

    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
        totalAmountElement.textContent = '0';
        return;
    }

    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price * item.quantity} ج.م</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">حذف</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });

    totalAmountElement.textContent = totalPrice;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

cartIcon.addEventListener('click', () => cartModal.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));

function checkout() {
    if (cart.length === 0) {
        alert('السلة فارغة!');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalElement.textContent = totalPrice;
    
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
}

closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));

// معالجة إرسال طلب العميل وإرساله للواتساب
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. جمع بيانات العميل المدخلة
    const customerName = document.getElementById('client-name').value;
    const customerPhone = document.getElementById('client-phone').value;
    const customerAddress = document.getElementById('client-address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. تنسيق رسالة الطلب بشكل مرتب واحترافي
    let message = `🛒 *طلب جديد من المتجر* 🛒\n\n`;
    message += `👤 *الاسم:* ${customerName}\n`;
    message += `📞 *الهاتف:* ${customerPhone}\n`;
    message += `📍 *العنوان:* ${customerAddress}\n`;
    message += `💳 *طريقة الدفع:* ${paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة إئتمانية'}\n\n`;
    message += `📦 *المنتجات المطلوبة:*\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (الكمية: ${item.quantity}) - ${item.price * item.quantity} ج.م\n`;
    });

    message += `\n💰 *الإجمالي الكلي:* *${totalPrice} ج.م*`;

    // 3. رقم واتساب الخاص بك (اكتب رقمك متبوعاً بكود الدولة بدون علامة +، مثال: 2010xxxxxxxx)
    const myWhatsAppNumber = "201154167785"; 

    // 4. ترميز الرسالة لتناسب روابط الويب (URL Encode)
    const encodedMessage = encodeURIComponent(message);

    // 5. إنشاء رابط الواتساب وفتحه في نافذة جديدة
    const whatsappURL = `https://wa.me/${myWhatsAppNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');

    // 6. تفريغ السلة وإغلاق النوافذ بعد إرسال الطلب
    cart = [];
    saveCart();
    updateCartUI();
    checkoutForm.reset();
    checkoutModal.classList.remove('active');
    
    alert(`شكراً لك يا ${customerName}! يتم الآن تحويلك إلى الواتساب لتأكيد الطلب.`);
});

// استدعاء دالة جلب المنتجات بدلاً من renderProducts العادية
fetchProducts();
updateCartUI();

// إضافة منتج للسلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
}

function increaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('my_store_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;

    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
        totalAmountElement.textContent = '0';
        return;
    }

    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price * item.quantity} ج.م</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">حذف</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });

    totalAmountElement.textContent = totalPrice;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// التحكم بالسلة
cartIcon.addEventListener('click', () => cartModal.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));

// إتمام الشراء فتح نافذة الشحن
function checkout() {
    if (cart.length === 0) {
        alert('السلة فارغة!');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalElement.textContent = totalPrice;
    
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
}

closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));

// معالجة إرسال طلب العميل
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const orderData = {
        customerName: document.getElementById('client-name').value,
        customerPhone: document.getElementById('client-phone').value,
        customerAddress: document.getElementById('client-address').value,
        paymentMethod: document.getElementById('payment-method').value,
        cartItems: cart,
        totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toLocaleString('ar-EG')
    };

    console.log("تفاصيل الطلب الجديد:", orderData);
    alert(`شكراً لك يا ${orderData.customerName}! تم استلام طلبك بنجاح وسنتواصل معك على الرقم ${orderData.customerPhone}`);

    cart = [];
    saveCart();
    updateCartUI();
    checkoutForm.reset();
    checkoutModal.classList.remove('active');
});

// تشغيل الواجهة أول مرة
renderProducts();
updateCartUI();