'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Watchlist } from '@/database/models/watchlist.model';
import { getStocksDetails } from './finnhub.actions';

// Add stock to watchlist
export const addToWatchlist = async (symbol: string, company: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) redirect('/sign-in');

        // Check if stock already exists in watchlist
        const existingItem = await Watchlist.findOne({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });

        if (existingItem) {
            return { success: false, error: 'Stock already in watchlist' };
        }

        // Add to watchlist
        const newItem = new Watchlist({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
            company: company.trim(),
        });

        await newItem.save();
        revalidatePath('/watchlist');

        return { success: true, message: 'Stock added to watchlist' };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw new Error('Failed to add stock to watchlist');
    }
};

// Remove stock from watchlist
export const removeFromWatchlist = async (symbol: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) redirect('/sign-in');

        // Remove from watchlist
        await Watchlist.deleteOne({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });
        revalidatePath('/watchlist');

        return { success: true, message: 'Stock removed from watchlist' };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error('Failed to remove stock from watchlist');
    }
};

// Get watchlist symbols for a user by email
export const getWatchlistSymbolsByEmail = async (email: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user || session.user.email !== email) return [];

        const watchlist = await Watchlist.find({ userId: session.user.id }).select('symbol').lean();
        return watchlist.map((item) => item.symbol);
    } catch (error) {
        console.error('Error fetching watchlist symbols:', error);
        return [];
    }
};

// Get user's watchlist
export const getUserWatchlist = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) redirect('/sign-in');

        const watchlist = await Watchlist.find({ userId: session.user.id })
            .sort({ addedAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(watchlist));
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        throw new Error('Failed to fetch watchlist');
    }
};

// Get user's watchlist with stock data
export const getWatchlistWithData = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) redirect('/sign-in');

        const watchlist = await Watchlist.find({ userId: session.user.id })
            .sort({ addedAt: -1 })
            .lean();

        if (watchlist.length === 0) return [];

        const stocksWithData = await Promise.all(
            watchlist.map(async (item) => {
                try {
                    const stockData = await getStocksDetails(item.symbol);

                    if (!stockData) {
                        console.warn(`Failed to fetch data for ${item.symbol}`);
                        return {
                            company: item.company,
                            symbol: item.symbol,
                        };
                    }

                    return {
                        company: stockData.company,
                        symbol: stockData.symbol,
                        currentPrice: stockData.currentPrice,
                        priceFormatted: stockData.priceFormatted,
                        changeFormatted: stockData.changeFormatted,
                        changePercent: stockData.changePercent,
                        marketCap: stockData.marketCapFormatted,
                        peRatio: stockData.peRatio,
                    };
                } catch (error) {
                    console.error(`Error loading data for ${item.symbol}:`, error);
                    return {
                        company: item.company,
                        symbol: item.symbol,
                    };
                }
            })
        );

        return JSON.parse(JSON.stringify(stocksWithData));
    } catch (error) {
        console.error('Error loading watchlist with data:', error);
        throw new Error('Failed to fetch watchlist');
    }
};