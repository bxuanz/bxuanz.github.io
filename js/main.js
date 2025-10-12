// --- 0. SCRIPT FOR LOADING HTML COMPONENTS ---
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    const componentPlaceholders = [
        { id: 'about-placeholder', url: 'components/about.html' },
        { id: 'publications-placeholder', url: 'components/publications.html' },
        { id: 'education-placeholder', url: 'components/education.html' },
        { id: 'skills-placeholder', url: 'components/skills.html' },
        { id: 'interests-placeholder', url: 'components/interests.html' },
        { id: 'footer-placeholder', url: 'components/footer.html' }
    ];

    const fetchPromises = componentPlaceholders.map(comp => {
        const placeholder = document.getElementById(comp.id);
        if (placeholder) {
            return fetch(comp.url)
                .then(response => response.ok ? response.text() : Promise.reject('File not found'))
                .then(data => {
                    placeholder.innerHTML = data;
                })
                .catch(error => console.error(`Error loading ${comp.id}:`, error));
        }
        return Promise.resolve();
    });

    // Wait for all components to be loaded before initializing other scripts
    Promise.all(fetchPromises).then(() => {
        // Dispatch a custom event to signal that components are ready
        document.dispatchEvent(new Event('componentsLoaded'));
    });
});

// --- 1. SCRIPT FOR BASIC PAGE INTERACTIONS (MENU, SCROLLING) ---
// ===================================================================
// This script now waits for the 'componentsLoaded' event
document.addEventListener('componentsLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll-triggered fade-in animations
    const sections = document.querySelectorAll('.section-fade');
    const handleScrollAnimations = () => {
        sections.forEach(section => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.75) {
                section.classList.add('section-visible');
                if (section.id === 'skills') {
                    document.querySelectorAll('.skill-progress').forEach(progress => {
                        progress.style.width = progress.getAttribute('data-width');
                    });
                }
            }
        });
    };
    
    window.addEventListener('load', handleScrollAnimations);
    window.addEventListener('scroll', handleScrollAnimations);
    handleScrollAnimations(); // Initial check
});

// --- 2. SCRIPT TO DYNAMICALLY LOAD PUBLICATIONS FROM JSON FILE ---
// ===================================================================
// This script also waits for the 'componentsLoaded' event
document.addEventListener('componentsLoaded', () => {
    const publicationsListContainer = document.getElementById('publications-list');
    if (!publicationsListContainer) return;

    fetch('publications.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(publications => {
            publications.forEach(pub => {
                const publicationItem = document.createElement('div');
                publicationItem.className = 'timeline-item mb-10 pl-6';

                let statusTag = '';
                if (pub.status === 'First Author') statusTag = `<span class="text-neon-pink font-bold ml-2">[${pub.status}]</span>`;
                else if (pub.status === 'Co-first Author') statusTag = `<span class="text-neon-blue font-bold ml-2">[${pub.status}]</span>`;
                
                let githubButton = '';
                if (pub.github) {
                    githubButton = `<a href="${pub.github}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-md border border-neon-blue/30 text-sm hover:bg-neon-blue/20 transition-all"><i class="fa fa-github mr-2"></i>View on GitHub</a>`;
                }

                publicationItem.innerHTML = `
                    <div class="bg-section-bg rounded-lg p-6 border border-neon-purple/20 hover:border-neon-purple/50 transition-colors">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-3">
                            <h3 class="text-xl text-neon-purple text-shadow-neon-purple font-bold">${pub.title}</h3>
                            <span class="text-gray-400">${pub.year}</span>
                        </div>
                        <h4 class="text-white mb-3">${pub.journal}</h4>
                        <ul class="list-disc pl-5 space-y-2">
                            <li>Authors: ${pub.authors} ${statusTag}</li>
                            ${pub.description ? `<li>${pub.description}</li>` : ''}
                        </ul>
                        ${githubButton}
                    </div>
                `;
                publicationsListContainer.appendChild(publicationItem);
            });
            if (publicationsListContainer.lastChild) publicationsListContainer.lastChild.classList.remove('mb-10');
        })
        .catch(error => {
            console.error('Error loading publications:', error);
            publicationsListContainer.innerHTML += '<p class="text-red-500 p-6">Could not load publications. Please check if publications.json is available.</p>';
        });
});

// --- 3. SCRIPT FOR INTERESTS & HOBBIES GALLERY MODAL ---
// ===================================================================
// This script also waits for the 'componentsLoaded' event
document.addEventListener('componentsLoaded', () => {
    // Define your image galleries here
    const galleries = {
        'foodie': [
            { src: 'images/foodie-1.jpg', caption: '美味的火锅 (Spicy Hotpot)' },
            { src: 'images/foodie-2.jpg', caption: '兰州拉面 (Hand-pulled Noodles)' },
        ],
        'sports': [ { src: 'images/sports-1.jpg', caption: '一场精彩的网球比赛' } ],
        'photography': [ { src: 'images/photography-1.jpg', caption: '傍晚的校园' } ]
    };

    const modal = document.getElementById('gallery-modal');
    if (!modal) return;

    const galleryTriggers = document.querySelectorAll('[data-gallery]');
    if (galleryTriggers.length === 0) return;

    const closeBtn = document.getElementById('modal-close-btn');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    let currentGallery = [], currentIndex = 0;

    function showImage(index) {
        if (index >= 0 && index < currentGallery.length) {
            modalImage.src = currentGallery[index].src;
            modalCaption.textContent = currentGallery[index].caption;
            currentIndex = index;
        }
        prevBtn.style.display = index > 0 ? 'block' : 'none';
        nextBtn.style.display = index < currentGallery.length - 1 ? 'block' : 'none';
    }
    function openModal(galleryKey) {
        if (galleries[galleryKey] && galleries[galleryKey].length > 0) {
            currentGallery = galleries[galleryKey];
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            showImage(0);
        }
    }
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        modalImage.src = '';
    }

    galleryTriggers.forEach(trigger => trigger.addEventListener('click', () => openModal(trigger.getAttribute('data-gallery'))));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => (e.target === modal) && closeModal());
    prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => showImage(currentIndex + 1));
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        }
    });
});