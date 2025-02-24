class ImageSlider {
    constructor() {
        this.slider = document.getElementById('imageSlider');
        this.slides = document.querySelectorAll('.slide');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.playPauseBtn = document.getElementById('playPauseBtn');

        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoPlay();
        this.preloadImages();
        this.updateTouchFeedback();
    }

    bindEvents() {
        
        this.prevBtn.addEventListener('click', () => {
            if (!this.isTransitioning) this.navigate('prev');
        });
        this.nextBtn.addEventListener('click', () => {
            if (!this.isTransitioning) this.navigate('next');
        });

        
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                if (!this.isTransitioning) this.goToSlide(index);
            });
        });

        
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());

        
        this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.slider.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.slider.addEventListener('touchend', () => this.handleTouchEnd());

        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        
        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    preloadImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                const loader = () => {
                    slide.classList.remove('loading');
                    img.removeEventListener('load', loader);
                };
                img.addEventListener('load', loader);
                img.addEventListener('error', () => {
                    slide.classList.remove('loading');
                    slide.classList.add('error');
                });
                slide.classList.add('loading');
            }
        });
    }

    navigate(direction) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const previousIndex = this.currentIndex;
        this.slides[previousIndex].classList.remove('active');
        this.thumbnails[previousIndex].classList.remove('active');

        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        }

        
        this.slides[this.currentIndex].classList.add('active');
        this.thumbnails[this.currentIndex].classList.add('active');
        this.thumbnails[this.currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600); 
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        this.isTransitioning = true;

        const previousIndex = this.currentIndex;
        this.slides[previousIndex].classList.remove('active');
        this.thumbnails[previousIndex].classList.remove('active');

        this.currentIndex = index;

        this.slides[this.currentIndex].classList.add('active');
        this.thumbnails[this.currentIndex].classList.add('active');

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => {
            if (!this.isTransitioning) this.navigate('next');
        }, this.autoPlayDelay);
        this.playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    }

    stopAutoPlay() {
        if (!this.autoPlayInterval) return;
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
        this.playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    updateTouchFeedback(e) {
        if (e) {
            const rect = this.slider.getBoundingClientRect();
            const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
            const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
            this.slider.style.setProperty('--x', `${x}%`);
            this.slider.style.setProperty('--y', `${y}%`);
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.slider.classList.add('touching');
        this.updateTouchFeedback(e);
        this.stopAutoPlay();
    }

    handleTouchMove(e) {
        if (e.touches.length > 0) {
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
            this.updateTouchFeedback(e);
        }
    }

    handleTouchEnd() {
        this.slider.classList.remove('touching');
        const swipeDistanceX = this.touchEndX - this.touchStartX;
        const swipeDistanceY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 50;

        
        if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) &&
            Math.abs(swipeDistanceX) > minSwipeDistance) {
            if (swipeDistanceX > 0) {
                this.navigate('prev');
            } else {
                this.navigate('next');
            }
        }
        this.startAutoPlay();
    }

    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                if (!this.isTransitioning) {
                    e.preventDefault();
                    this.navigate('prev');
                }
                break;
            case 'ArrowRight':
                if (!this.isTransitioning) {
                    e.preventDefault();
                    this.navigate('next');
                }
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoPlay();
                break;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
});
