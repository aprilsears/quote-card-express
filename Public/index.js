'use strict';

class QuoteDisplay {
    constructor(options = {}) {
        this.elements = {
            quote: document.getElementById(options.quoteId || "quote"),
            author: document.getElementById(options.authorId || "author"),
            background: document.querySelector(options.backgroundSelector || ".background-img")
        };
        
        this.config = {
            interval: options.interval || 3000,
            imageEndpoint: options.imageEndpoint || 'http://localhost:1776/api/getRandomImage',
            fadeTime: options.fadeTime || 600
        };

        this.currentIndex = 0;
        this.quotes = [
            {
                quote: "Luck is what happens when preparation meets opportunity.",
                author: "-Seneca"
            },
            {
                quote: "More is lost by indecision than wrong decision.",
                author: "-Marcus Tullius Cicero"
            },
            {
                quote: "The best answer to anger is silence.",
                author: "-Marcus Aurelius"
            }
        ];

        // Added transition styles
        this.setupStyles();
    }

    setupStyles() {
        // Added CSS transitions
        this.elements.quote.style.transition = `opacity ${this.config.fadeTime}ms ease-in-out`;
        this.elements.author.style.transition = `opacity ${this.config.fadeTime}ms ease-in-out`;
        this.elements.background.style.transition = `opacity ${this.config.fadeTime}ms ease-in-out`;
    }

    async getRandomPhoto() {
        try {
            const response = await fetch(this.config.imageEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Preload the image
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(data.data);
                img.onerror = reject;
                img.src = data.data;
            });
        } catch (error) {
            console.error('Failed to fetch random photo:', error);
            throw error;
        }
    }

    async fadeOut() {
        this.elements.quote.style.opacity = '0';
        this.elements.author.style.opacity = '0';
        this.elements.background.style.opacity = '0';
        return new Promise(resolve => setTimeout(resolve, this.config.fadeTime));
    }

    async fadeIn() {
        this.elements.quote.style.opacity = '1';
        this.elements.author.style.opacity = '1';
        this.elements.background.style.opacity = '1';
        return new Promise(resolve => setTimeout(resolve, this.config.fadeTime));
    }

    async updateContent() {
        try {
            // Fade out current content
            await this.fadeOut();

            // Updateed text content
            const quote = this.quotes[this.currentIndex];
            this.elements.quote.textContent = quote.quote;
            this.elements.author.textContent = quote.author;

            // Get and set new background image
            const imageUrl = await this.getRandomPhoto();
            this.elements.background.style.backgroundImage = `url(${imageUrl})`;

            // Fade in new content
            await this.fadeIn();

            // Update index
            this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        } catch (error) {
            console.error('Error updating content:', error);
            // Continue to next update even if this one fails
        }
    }

    start() {
        // Initial update
        setTimeout(() => {
            this.updateContent();
            // Start regular updates
            setInterval(() => this.updateContent(), this.config.interval);
        }, this.config.interval);
    }

    addQuote(quote, author) {
        this.quotes.push({ quote, author });
    }
}

// Usage
const quoteDisplay = new QuoteDisplay({
    // Optional custom configuration
    interval: 3000,
    imageEndpoint: 'http://localhost:1776/api/getRandomImage',
    fadeTime: 600
});

quoteDisplay.start();