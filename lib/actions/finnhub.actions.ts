'use server';

import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWatchlistSymbolsByEmail } from './watchlist.actions';
import { cache } from 'react';
import { formatPrice, formatChangePercent, formatMarketCapValue } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchJSON<T>(url: string, revalidate?: number): Promise<T> {
    const res = await fetch(url, {
        next: { revalidate: revalidate || 0 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

interface QuoteData {
    c: number;
    dp: number;
}

interface ProfileData {
    name: string;
    ticker: string;
    marketCapitalization: number;
    exchange: string;
}

interface FinancialsData {
    metric: {
        peNormalizedAnnual: number;
    };
}

interface FinnhubSearchResult {
    symbol: string;
    description: string;
    displaySymbol: string;
    type: string;
}

interface FinnhubSearchResponse {
    result: FinnhubSearchResult[];
}

export interface StockWithWatchlistStatus {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
    isInWatchlist: boolean;
}

export const searchStocks = cache(
    async (query?: string): Promise<StockWithWatchlistStatus[]> => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            if (!session?.user) redirect('/sign-in');

            const userWatchlistSymbols = await getWatchlistSymbolsByEmail(
                session.user.email
            );

            const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
            if (!token) {
                console.error('FINNHUB API key is not configured');
                return [];
            }

            const trimmed = typeof query === 'string' ? query.trim() : '';
            let results: FinnhubSearchResult[] = [];

            if (!trimmed) {
                const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
                const profiles = await Promise.all(
                    top.map(async (sym) => {
                        try {
                            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(
                                sym
                            )}&token=${token}`;
                            const profile = await fetchJSON<any>(url, 3600);
                            return { sym, profile };
                        } catch (e) {
                            console.error('Error fetching profile2 for', sym, e);
                            return { sym, profile: null };
                        }
                    })
                );

                results = profiles
                    .map(({ sym, profile }) => {
                        const symbol = sym.toUpperCase();
                        const name: string | undefined = profile?.name || profile?.ticker || undefined;
                        const exchange: string | undefined = profile?.exchange || undefined;
                        if (!name) return undefined;
                        const r: FinnhubSearchResult = {
                            symbol,
                            description: name,
                            displaySymbol: symbol,
                            type: 'Common Stock',
                        };
                        (r as any).__exchange = exchange;
                        return r;
                    })
                    .filter((x): x is FinnhubSearchResult => Boolean(x));
            } else {
                const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(
                    trimmed
                )}&token=${token}`;
                const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
                results = Array.isArray(data?.result) ? data.result : [];
            }

            const mapped: StockWithWatchlistStatus[] = results
                .map((r) => {
                    const upper = (r.symbol || '').toUpperCase();
                    const name = r.description || upper;
                    const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
                    const exchangeFromProfile = (r as any).__exchange as string | undefined;
                    const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
                    const type = r.type || 'Stock';
                    return {
                        symbol: upper,
                        name,
                        exchange,
                        type,
                        isInWatchlist: userWatchlistSymbols.includes(upper),
                    };
                })
                .slice(0, 15);

            return mapped;
        } catch (err) {
            console.error('Error in stock search:', err);
            return [];
        }
    }
);

// Fetch stock details by symbol
export const getStocksDetails = cache(async (symbol: string) => {
    const cleanSymbol = symbol.trim().toUpperCase();

    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) throw new Error('FINNHUB API key is not configured');

        const [quote, profile, financials] = await Promise.all([
            fetchJSON(
                `${FINNHUB_BASE_URL}/quote?symbol=${cleanSymbol}&token=${token}`
            ),
            fetchJSON(
                `${FINNHUB_BASE_URL}/stock/profile2?symbol=${cleanSymbol}&token=${token}`,
                3600
            ),
            fetchJSON(
                `${FINNHUB_BASE_URL}/stock/metric?symbol=${cleanSymbol}&metric=all&token=${token}`,
                1800
            ),
        ]);

        const quoteData = quote as QuoteData;
        const profileData = profile as ProfileData;
        const financialsData = financials as FinancialsData;

        if (!quoteData?.c || !profileData?.name)
            throw new Error('Invalid stock data received from API');

        const changePercent = quoteData.dp || 0;
        const peRatio = financialsData?.metric?.peNormalizedAnnual || null;

        return {
            symbol: cleanSymbol,
            company: profileData?.name,
            currentPrice: quoteData.c,
            changePercent,
            priceFormatted: formatPrice(quoteData.c),
            changeFormatted: formatChangePercent(changePercent),
            peRatio: peRatio?.toFixed(1) || '—',
            marketCapFormatted: formatMarketCapValue(
                profileData?.marketCapitalization || 0
            ),
        };
    } catch (error) {
        console.error(`Error fetching details for ${cleanSymbol}:`, error);
        throw new Error('Failed to fetch stock details');
    }
});

// Fetch market news or company news
export const getNews = cache(async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) throw new Error('FINNHUB API key is not configured');

        // If symbols are provided, fetch company news for the first few symbols
        if (symbols && symbols.length > 0) {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            const formatDate = (date: Date) => date.toISOString().split('T')[0];

            const from = formatDate(lastWeek);
            const to = formatDate(today);

            // Fetch news for the first 3 symbols to avoid rate limits/overwhelming data
            const newsPromises = symbols.slice(0, 3).map((symbol) =>
                fetchJSON<MarketNewsArticle[]>(
                    `${FINNHUB_BASE_URL}/company-news?symbol=${symbol.toUpperCase()}&from=${from}&to=${to}&token=${token}`,
                    3600
                )
            );

            const nestedNews = await Promise.all(newsPromises);
            const allNews = nestedNews.flat();

            // Sort by date descending and remove duplicates
            return allNews
                .sort((a, b) => b.datetime - a.datetime)
                .filter((article, index, self) =>
                    index === self.findIndex((t) => t.id === article.id)
                );
        }

        // Default: Fetch general market news
        return await fetchJSON<MarketNewsArticle[]>(
            `${FINNHUB_BASE_URL}/news?category=general&token=${token}`,
            3600
        );
    } catch (error) {
        console.error('Error fetching market news:', error);
        return [];
    }
});