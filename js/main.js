document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. DOM Elements Selection ---
    const gallery = document.querySelector('.product-gallery');
    const noImageGallery = document.querySelector('.no-image-gallery');
    const noImageSection = document.getElementById('no-image-section');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const searchInput = document.getElementById('search-input');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const whatsappNumber = '201270483365';

    // --- 2. Helper Functions ---
    
    /**
     * Custom sorter for clothing sizes.
     * Sorts sizes logically (S, M, L, XL...) instead of alphabetically.
     */
    function sortSizes(sizes) {
        if (!sizes || sizes.length === 0) return ["غير محدد"];
        const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, '2XL': 5, '3XL': 6, '4XL': 7, '5XL': 8, '6XL': 9, '7XL': 10, '8XL': 11 };
        const standardSizes = sizes.filter(s => sizeOrder[s.toUpperCase()]);
        const otherSizes = sizes.filter(s => !sizeOrder[s.toUpperCase()]);

        standardSizes.sort((a, b) => sizeOrder[a.toUpperCase()] - sizeOrder[b.toUpperCase()]);
        otherSizes.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

        return [...otherSizes, ...standardSizes];
    }

    // --- 3. Rendering Functions ---

    /**
     * Renders products, separating items with and without images.
     */
    function renderProducts(productsToRender) {
        gallery.innerHTML = '';
        noImageGallery.innerHTML = '';

        const productsWithImages = productsToRender.filter(p => p.images && p.images.length > 0);
        const productsWithoutImages = productsToRender.filter(p => !p.images || p.images.length === 0);

        if (productsWithImages.length > 0) {
            productsWithImages.forEach(product => {
                const hasMultipleImages = product.images.length > 1;
                const imagesHTML = product.images.map((imgSrc, index) => 
                    `<img src="${imgSrc}" alt="${product.name} - صورة ${index + 1}" class="${index === 0 ? 'active' : ''}" loading="lazy">`
                ).join('');

                const sliderNavHTML = hasMultipleImages ? `
                    <div class="slider-nav">
                        <button class="slider-btn prev-btn" aria-label="الصورة السابقة"><i class="fas fa-chevron-left"></i></button>
                        <button class="slider-btn next-btn" aria-label="الصورة التالية"><i class="fas fa-chevron-right"></i></button>
                    </div>` : '';
                
                const sortedSizes = sortSizes(product.sizes).join(', ');

                const productCardHTML = `
                    <div class="product-card reveal" data-current-slide="0">
                        <div class="img-container">
                            <div class="slider-images">${imagesHTML}</div>
                            ${sliderNavHTML}
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="product-price">${product.price}</p>
                            <div class="product-details">
                                <span><strong>الألوان:</strong> ${product.colors.join(', ')}</span><br>
                                <span><strong>المقاسات:</strong> ${sortedSizes}</span>
                            </div>
                            <button class="order-btn" data-product-name="${product.name}">اطلبه الآن عبر واتساب</button>
                        </div>
                    </div>`;
                gallery.insertAdjacentHTML('beforeend', productCardHTML);
            });
        }
        
        if (productsWithoutImages.length > 0) {
            noImageSection.style.display = 'block';
            productsWithoutImages.forEach(product => {
                const sortedSizes = sortSizes(product.sizes).join(', ');

                const noImageCardHTML = `
                <div class="no-image-card reveal">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                        <div class="product-details">
                            <span><strong>الألوان:</strong> ${product.colors.join(', ')}</span><br>
                            <span><strong>المقاسات:</strong> ${sortedSizes}</span>
                        </div>
                        <button class="order-btn" data-product-name="${product.name}">اطلبه الآن عبر واتساب</button>
                    </div>
                </div>
                `;
                noImageGallery.insertAdjacentHTML('beforeend', noImageCardHTML);
            });
        } else {
            noImageSection.style.display = 'none';
        }

        if (productsToRender.length === 0) {
            gallery.innerHTML = '<p style="text-align:center; font-size: 1.2rem; grid-column: 1 / -1;">لا توجد منتجات تطابق بحثك حالياً.</p>';
        }

        revealOnScroll();
    }
    
    // --- 4. Filtering and Searching Logic ---

    function updateDisplay() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const searchTerm = searchInput.value.toLowerCase().trim();

        let filteredProducts = productsData;

        if (activeFilter !== 'الكل') {
            filteredProducts = filteredProducts.filter(p => p.category === activeFilter);
        }

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm)
            );
        }

        renderProducts(filteredProducts);
    }
    
    function setupEventListeners() {
        filterButtonsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-btn')) {
                document.querySelector('.filter-btn.active').classList.remove('active');
                event.target.classList.add('active');
                updateDisplay();
            }
        });

        searchInput.addEventListener('input', updateDisplay);

        document.getElementById('products').addEventListener('click', function(event) {
            const orderBtn = event.target.closest('.order-btn');
            if (orderBtn) {
                const productName = orderBtn.dataset.productName;
                const message = encodeURIComponent(`مرحباً، أرغب في طلب المنتج التالي: ${productName}`);
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                return;
            }

            const sliderBtn = event.target.closest('.slider-btn');
            if (sliderBtn) {
                const card = sliderBtn.closest('.product-card');
                const images = card.querySelectorAll('.slider-images img');
                let currentIndex = parseInt(card.dataset.currentSlide);
                images[currentIndex].classList.remove('active');
                if (sliderBtn.classList.contains('next-btn')) {
                    currentIndex = (currentIndex + 1) % images.length;
                } else {
                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                }
                images[currentIndex].classList.add('active');
                card.dataset.currentSlide = currentIndex;
            }
        });
    }

    // --- 5. UI and Animations ---
    
    function revealOnScroll() {
        const reveals = document.querySelectorAll(".reveal:not(.active)");
        const windowHeight = window.innerHeight;
        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                el.classList.add("active");
            }
        });
    }
    
    function setupMobileMenu() {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }

    // --- 6. Initialization ---

    function initializeApp() {
        const categories = ['الكل', ...new Set(productsData.map(p => p.category))];
        filterButtonsContainer.innerHTML = categories.map(category => 
            `<button class="filter-btn ${category === 'الكل' ? 'active' : ''}" data-filter="${category}">${category}</button>`
        ).join('');
        
        setupEventListeners();
        setupMobileMenu();
        window.addEventListener("scroll", revealOnScroll);
        
        updateDisplay(); 
    }

    initializeApp();
});