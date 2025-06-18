document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Elements & State ---
    const header = document.getElementById('main-header');
    const gallery = document.querySelector('.product-gallery');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const searchInput = document.getElementById('search-input');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const whatsappNumber = '201270483365';

    const modal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('product-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalProductDetails = document.getElementById('modal-product-details');
    const modalOrderBtn = document.getElementById('modal-order-btn');
    const modalImageContainer = modal.querySelector('.modal-image-container');

    // --- 2. Helper Functions ---
    function sortSizes(sizes) {
        if (!sizes || sizes.length === 0) return ["غير محدد"];
        const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, '2XL': 5, '3XL': 6, '4XL': 7, '5XL': 8, '6XL': 9, '7XL': 10, '8XL': 11 };
        const standardSizes = sizes.filter(s => sizeOrder[s.toUpperCase()]);
        const otherSizes = sizes.filter(s => !sizeOrder[s.toUpperCase()]);
        standardSizes.sort((a, b) => sizeOrder[a.toUpperCase()] - sizeOrder[b.toUpperCase()]);
        otherSizes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        return [...otherSizes, ...standardSizes];
    }

    // --- 3. Rendering --- 
    function renderProducts(productsToRender) {
        gallery.innerHTML = '';

        if (productsToRender.length === 0) {
            gallery.innerHTML = '<p class="no-results">لا توجد منتجات تطابق بحثك.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const hasImages = product.images && product.images.length > 0;
            const tagHTML = product.tag ? `<div class="product-tag">${product.tag}</div>` : '';
            let cardHTML = '';

            if (hasImages) {
                cardHTML = `
                <div class="product-card" data-product-id="${product.id}">
                    ${tagHTML}
                    <div class="img-container">
                        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                    </div>
                </div>`;
            } else {
                cardHTML = `
                <div class="product-card no-image-card">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                        <div class="product-details">
                            <span><strong>الألوان:</strong> ${product.colors.join(', ')}</span><br>
                            <span><strong>المقاسات:</strong> ${sortSizes(product.sizes).join(', ')}</span>
                        </div>
                        <button class="order-btn" data-product-name="${product.name}">اطلبه الآن</button>
                    </div>
                </div>`;
            }
            gallery.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        staggeredCardAnimation();
    }

    // --- 4. Animations ---
    function staggeredCardAnimation() {
        const cards = gallery.querySelectorAll('.product-card:not(.visible)');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 60}ms`;
            card.classList.add('reveal', 'visible');
        });
        revealOnScroll();
    }

    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal:not(.active)');
        const windowHeight = window.innerHeight;
        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 80) {
                el.classList.add('active');
            }
        });
    }

    // --- 5. Modal Logic ---
    function openModal(productId) {
        const product = productsData.find(p => p.id === productId);
        if (!product || !product.images || product.images.length === 0) return;

        modalProductName.textContent = product.name;
        modalProductPrice.textContent = product.price;
        const message = encodeURIComponent(`مرحباً، أرغب في طلب المنتج: ${product.name}`);
        modalOrderBtn.href = `https://wa.me/${whatsappNumber}?text=${message}`;

        modalProductDetails.innerHTML = `
            <span><strong>الألوان:</strong> ${product.colors.join(', ')}</span><br>
            <span><strong>المقاسات:</strong> ${sortSizes(product.sizes).join(', ')}</span>`;
        
        const modalSlider = modalImageContainer.querySelector('.modal-slider-images');
        modalSlider.innerHTML = product.images.map((img, i) => 
            `<img src="${img}" alt="${product.name}" class="${i === 0 ? 'active' : ''}">`).join('');
        
        modalImageContainer.dataset.currentSlide = 0;
        let navHTML = '';
        if (product.images.length > 1) {
            navHTML = `
            <div class="modal-slider-nav">
                <button class="slider-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                <button class="slider-btn next-btn"><i class="fas fa-chevron-right"></i></button>
            </div>`;
        }
        const oldNav = modalImageContainer.querySelector('.modal-slider-nav');
        if(oldNav) oldNav.remove();
        modalImageContainer.insertAdjacentHTML('beforeend', navHTML);

        document.body.classList.add('modal-open');
        modal.classList.add('active');
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    // --- 6. Filtering & Searching ---
    function updateDisplay() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredProducts = productsData;
        if (activeFilter !== 'الكل') filteredProducts = filteredProducts.filter(p => p.category === activeFilter);
        if (searchTerm) filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
        renderProducts(filteredProducts);
    }

    // --- 7. Event Listeners ---
    function setupEventListeners() {
        gallery.addEventListener('click', (event) => {
            const orderBtn = event.target.closest('.order-btn');
            if(orderBtn) {
                 const message = encodeURIComponent(`مرحباً، أرغب في طلب المنتج: ${orderBtn.dataset.productName}`);
                 window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                 return;
            }
            const card = event.target.closest('.product-card:not(.no-image-card)');
            if (card) {
                openModal(parseInt(card.dataset.productId));
            }
        });
        
        modal.addEventListener('click', (event) => {
            const sliderBtn = event.target.closest('.slider-btn');
            if (sliderBtn) {
                const images = modal.querySelectorAll('.modal-slider-images img');
                let currentIndex = parseInt(modalImageContainer.dataset.currentSlide);
                images[currentIndex].classList.remove('active');
                if (sliderBtn.classList.contains('next-btn')) currentIndex = (currentIndex + 1) % images.length;
                else currentIndex = (currentIndex - 1 + images.length) % images.length;
                images[currentIndex].classList.add('active');
                modalImageContainer.dataset.currentSlide = currentIndex;
            }
        });
        
        filterButtonsContainer.addEventListener('click', e => { if(e.target.classList.contains('filter-btn')) { document.querySelector('.filter-btn.active').classList.remove('active'); e.target.classList.add('active'); updateDisplay(); } });
        searchInput.addEventListener('input', updateDisplay);

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        
        window.addEventListener('scroll', () => {
            revealOnScroll();
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        menuToggle.addEventListener('click', () => { mobileMenu.classList.toggle('active'); menuToggle.classList.toggle('open'); });
        mobileMenu.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { mobileMenu.classList.remove('active'); menuToggle.classList.remove('open'); }); });
    }
    
    // --- 8. Initialization ---
    function initializeApp() {
        const categories = ['الكل', ...new Set(productsData.map(p => p.category))];
        filterButtonsContainer.innerHTML = categories.map(cat => `<button class="filter-btn ${cat === 'الكل' ? 'active' : ''}" data-filter="${cat}">${cat}</button>`).join('');
        
        setupEventListeners();
        updateDisplay();
        revealOnScroll(); 
    }

    initializeApp();
});