class PageTransitions {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 5;
        this.transitionType = 'slide';
        this.isAnimating = false;
        this.pageNames = ['welcome', 'animations', 'effects', 'interaction', 'ready'];
        this.routes = ['/', '/animations', '/effects', '/interaction', '/ready'];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateIndicators();
        this.updateNavigation();
    }

    bindEvents() {
        // Transition type selector
        const transitionSelect = document.getElementById('transitionType');
        if (transitionSelect) {
            transitionSelect.addEventListener('change', (e) => {
                this.transitionType = e.target.value;
            });
        }

        // Page indicators
        document.querySelectorAll('.indicator-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetPage = parseInt(e.target.dataset.page);
                this.goToPage(targetPage);
            });
        });

        // Navigation links
        document.querySelectorAll('.transition-link, .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = parseInt(link.dataset.page);
                const url = link.getAttribute('href');
                this.navigateToPage(targetPage, url);
            });
        });

        // Touch/swipe support
        this.bindTouchEvents();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    this.goToPage(this.currentPage + 1);
                    break;
                case 'ArrowLeft':
                    this.goToPage(this.currentPage - 1);
                    break;
                case 'Home':
                    this.goToPage(0);
                    break;
                case 'End':
                    this.goToPage(this.totalPages - 1);
                    break;
            }
        });
    }

    async navigateToPage(pageIndex, url) {
        if (this.isAnimating || pageIndex === this.currentPage || pageIndex < 0 || pageIndex >= this.totalPages) {
            return;
        }

        this.isAnimating = true;
        
        try {
            // Fetch new page content
            const response = await fetch(`/api/page/${this.pageNames[pageIndex]}`);
            const data = await response.json();
            
            if (response.ok) {
                // Update browser URL without reload
                history.pushState({ pageIndex }, '', url);
                
                // Perform transition
                await this.transitionToNewContent(data.html, pageIndex);
                
                this.currentPage = pageIndex;
                this.updateIndicators();
                this.updateNavigation();
            }
        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    async transitionToNewContent(newHtml, pageIndex) {
        const container = document.getElementById('pageContainer');
        const isForward = pageIndex > this.currentPage;
        
        // Create new page element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHtml;
        const newPage = tempDiv.firstElementChild;
        
        // Position new page for transition
        this.preparePageForTransition(newPage, isForward, true);
        container.appendChild(newPage);
        
        // Get current page
        const currentPage = container.querySelector('.page.active');
        
        // Force reflow
        newPage.offsetHeight;
        
        // Start transition
        if (currentPage) {
            this.applyTransition(currentPage, newPage, isForward);
        } else {
            newPage.classList.add('active');
        }
        
        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Clean up
        if (currentPage) {
            currentPage.remove();
        }
        newPage.classList.add('active');
        this.removeTransitionClasses(newPage);
    }

    preparePageForTransition(page, isForward, isNew) {
        page.classList.remove('active');
        
        switch(this.transitionType) {
            case 'slide':
                if (isNew) {
                    page.classList.add(isForward ? 'slide-up' : 'slide-down');
                }
                break;
            case 'fade':
                if (isNew) {
                    page.classList.add('fade-out');
                }
                break;
            case 'zoom':
                if (isNew) {
                    page.classList.add('zoom-in-start');
                }
                break;
            case 'rotate':
                if (isNew) {
                    page.classList.add('rotate-out');
                }
                break;
            case 'flip':
                if (isNew) {
                    page.classList.add('flip-out');
                }
                break;
            case 'cube':
                if (isNew) {
                    page.classList.add(isForward ? 'cube-right' : 'cube-left');
                }
                break;
        }
    }

    applyTransition(currentPage, newPage, isForward) {
        switch(this.transitionType) {
            case 'slide':
                currentPage.classList.add(isForward ? 'slide-left' : 'slide-right');
                newPage.classList.remove(isForward ? 'slide-right' : 'slide-left');
                break;
            case 'fade':
                currentPage.classList.add('fade-out');
                newPage.classList.remove('fade-out');
                break;
            case 'zoom':
                currentPage.classList.add('zoom-out');
                newPage.classList.remove('zoom-in-start');
                break;
            case 'rotate':
                currentPage.classList.add('rotate-out');
                newPage.classList.remove('rotate-out');
                break;
            case 'flip':
                currentPage.classList.add('flip-out');
                newPage.classList.remove('flip-out');
                break;
            case 'cube':
                currentPage.classList.add(isForward ? 'cube-left' : 'cube-right');
                newPage.classList.remove(isForward ? 'cube-right' : 'cube-left');
                break;
        }
    }

    removeTransitionClasses(page) {
        const transitionClasses = [
            'slide-left', 'slide-right', 'slide-up', 'slide-down',
            'fade-out', 'zoom-out', 'zoom-in-start', 'rotate-out',
            'flip-out', 'cube-left', 'cube-right'
        ];
        page.classList.remove(...transitionClasses);
    }

    goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.totalPages) {
            this.navigateToPage(pageIndex, this.routes[pageIndex]);
        }
    }

    updateIndicators() {
        document.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentPage);
        });
    }

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach((link, index) => {
            link.classList.toggle('active', index === this.currentPage);
        });
    }

    bindTouchEvents() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = startX - endX;
        const deltaY = startY - endY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > minSwipeDistance) {
                this.goToPage(this.currentPage + 1);
            } else if (deltaX < -minSwipeDistance) {
                this.goToPage(this.currentPage - 1);
            }
        }
    }
}

// Initialize when DOM is loaded
let pageTransitions;

function initializePage() {
    pageTransitions = new PageTransitions();
    pageTransitions.currentPage = window.currentPageIndex || 0;
    pageTransitions.updateIndicators();
    pageTransitions.updateNavigation();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && typeof e.state.pageIndex !== 'undefined') {
        pageTransitions.currentPage = e.state.pageIndex;
        location.reload(); // Simple reload for back/forward
    }
});