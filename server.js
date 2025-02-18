'use strict';

import express from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Server configuration
const app = express();
const port = process.env.PORT || 1776;

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:1776', 'http://127.0.0.1:1776'],
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting for Unsplash API
const apiLimiter = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_HOUR = 50;   // Unsplash free tier limit

const getRandomPhoto = async () => {
    if (!process.env.UNSPLASH_CLIENT_ID) {
        throw new Error('Unsplash client ID not configured');
    }

    // Check rate limit
    const now = Date.now();
    const hourAgo = now - RATE_LIMIT_WINDOW;
    const recentRequests = Array.from(apiLimiter.entries())
        .filter(([timestamp]) => timestamp > hourAgo);
    
    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
        throw new Error('Rate limit exceeded');
    }

    // Add current request to rate limiter
    apiLimiter.set(now, true);

    // Clean up old entries
    for (const [timestamp] of apiLimiter.entries()) {
        if (timestamp <= hourAgo) {
            apiLimiter.delete(timestamp);
        }
    }

    const url = `https://api.unsplash.com/photos/random/?client_id=${process.env.UNSPLASH_CLIENT_ID}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();
        return data.urls.regular;
    } catch (error) {
        console.error('Error fetching photo:', error);
        throw error;
    }
};

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/api/getRandomImage", async (req, res) => {
    try {
        const imageUrl = await getRandomPhoto();
        res.status(200).json({
            status: 200,
            data: imageUrl
        });
    } catch (error) {
        console.error('API error:', error);
        
        if (error.message === 'Rate limit exceeded') {
            return res.status(429).json({
                status: 429,
                error: "Too many requests"
            });
        }

        res.status(500).json({
            status: 500,
            error: "Failed to fetch image"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        error: "Something broke!"
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to quit');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});