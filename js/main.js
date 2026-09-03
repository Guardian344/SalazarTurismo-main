document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. Menú Móvil (Hamburger Menu)
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Cambiar el ícono (hamburguesa a X)
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Cerrar el menú al hacer clic en un enlace (móviles)
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    /* ==========================================================================
       2. Efecto Glassmorphism en el Navbar al hacer Scroll
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Escuchar el evento scroll
    window.addEventListener('scroll', handleScroll);
    // Ejecutar una vez al cargar por si recargan a mitad de página
    handleScroll();

    /* ==========================================================================
       3. Animaciones al hacer Scroll (Intersection Observer)
       ========================================================================== */
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // 15% del elemento debe ser visible para animarse
    };
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: Dejar de observar una vez que ya apareció para mejor rendimiento
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });

    /* ==========================================================================
       4. Lightbox Galería
       ========================================================================== */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImages = document.getElementById('lightboxImages');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imagesData = item.getAttribute('data-images');
                if (imagesData) {
                    currentGalleryImages = JSON.parse(imagesData);
                    currentImageIndex = 0;
                    updateLightboxImage();
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Evitar scroll de la página de fondo
                }
            });
        });

        const updateLightboxImage = () => {
            if(currentGalleryImages.length > 0) {
                lightboxImages.innerHTML = `<img src="${currentGalleryImages[currentImageIndex]}" class="lightbox-img active" alt="Gallery Image">`;
            }
        };

        const nextImage = () => {
            currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
            updateLightboxImage();
        };

        const prevImage = () => {
            currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxImage();
        };

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });
        
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });

        // Cerrar al hacer clic fuera de la imagen
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-images')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ==========================================================================
       5. WebAR Redirection Logic
       ========================================================================== */
    const openArBtns = document.querySelectorAll('#openArBtn');

    if (openArBtns.length > 0) {
        openArBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Redirigir directamente a ar.html para evitar problemas de permisos de cámara en iframes en dispositivos móviles
                window.location.href = 'ar.html';
            });
        });
    }

});
