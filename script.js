// ===== THREE.JS 3D SPRING =====
function initSpring3D() {
    const container = document.getElementById('hero-3d-container');
    const canvas = document.getElementById('spring-canvas');
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Create coil spring geometry
    const springGroup = new THREE.Group();
    const coils = 8;
    const radius = 1.2;
    const height = 4;
    const tubeRadius = 0.12;
    const segments = 300;

    const springCurve = new THREE.Curve();
    springCurve.getPoint = function (t) {
        const angle = t * Math.PI * 2 * coils;
        const y = (t - 0.5) * height;
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
    };

    const springGeometry = new THREE.TubeGeometry(springCurve, segments, tubeRadius, 16, false);
    const springMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
    });

    const spring = new THREE.Mesh(springGeometry, springMaterial);
    springGroup.add(spring);

    // End caps
    const capGeom = new THREE.CylinderGeometry(radius + tubeRadius, radius + tubeRadius, 0.15, 32);
    const capMat = new THREE.MeshPhysicalMaterial({
        color: 0x059669,
        metalness: 0.95,
        roughness: 0.1,
        clearcoat: 1.0,
    });

    const topCap = new THREE.Mesh(capGeom, capMat);
    topCap.position.y = height / 2;
    springGroup.add(topCap);

    const bottomCap = new THREE.Mesh(capGeom, capMat);
    bottomCap.position.y = -height / 2;
    springGroup.add(bottomCap);

    // Inner glow sphere
    const glowGeom = new THREE.SphereGeometry(0.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.15,
    });
    const glowSphere = new THREE.Mesh(glowGeom, glowMat);
    springGroup.add(glowSphere);

    scene.add(springGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 1, 20);
    pointLight1.position.set(-3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06d6a0, 0.8, 20);
    pointLight2.position.set(3, -2, 3);
    scene.add(pointLight2);

    const rimLight = new THREE.PointLight(0x34d399, 0.5, 15);
    rimLight.position.set(0, 5, -3);
    scene.add(rimLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth 360-degree rotation along the vertical Y-axis
        springGroup.rotation.y += 0.015;

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function onResize() {
        const w = container.clientWidth;
        const h = Math.min(container.clientHeight, 500);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);
    onResize();
}

// ===== PARTICLE BACKGROUND =====
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += 0.02;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            const currentOpacity = this.opacity + Math.sin(this.pulse) * 0.1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${currentOpacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.draw();
        });
    }
    animateParticles();
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, parseInt(delay));
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ===== 3D CARD TILT =====
function initCardTilt() {
    const cards = document.querySelectorAll('.card-3d');

    cards.forEach(card => {
        const inner = card.querySelector('.card-3d-inner');
        if (!inner) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;

            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlight
        const sections = document.querySelectorAll('.section, .hero');
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Hamburger toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
    }

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });
}

// ===== GALLERY CAROUSEL =====
function initGallery() {
    const track = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    if (!track) return;

    let currentPos = 0;
    const itemWidth = 304; // 280px + 24px gap
    const items = track.querySelectorAll('.gallery-item');
    const maxPos = -(items.length * itemWidth - track.parentElement.clientWidth);

    function updateTrack() {
        track.style.transform = `translateX(${currentPos}px)`;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPos = Math.max(currentPos - itemWidth * 2, maxPos);
            updateTrack();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentPos = Math.min(currentPos + itemWidth * 2, 0);
            updateTrack();
        });
    }

    // Touch / drag support
    let isDragging = false;
    let startX, startPos;

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startPos = currentPos;
        track.style.transition = 'none';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const diff = e.clientX - startX;
        currentPos = Math.max(Math.min(startPos + diff, 0), maxPos);
        updateTrack();
    });

    track.addEventListener('mouseup', () => {
        isDragging = false;
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    track.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
    });

    // Touch support
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startPos = currentPos;
        track.style.transition = 'none';
    });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientX - startX;
        currentPos = Math.max(Math.min(startPos + diff, 0), maxPos);
        updateTrack();
    });

    track.addEventListener('touchend', () => {
        isDragging = false;
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        const whatsappMsg = `Hi, I'm ${name}.%0AEmail: ${email}%0APhone: ${phone}%0AMessage: ${message}`;
        window.open(`https://wa.me/919226890226?text=${whatsappMsg}`, '_blank');

        form.reset();
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initSpring3D();
    initParticles();
    initScrollReveal();
    initCardTilt();
    initNavbar();
    initGallery();
    initContactForm();
    initSmoothScroll();
});
