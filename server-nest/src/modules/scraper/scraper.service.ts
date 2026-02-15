import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use Stealth Plugin
puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);

    async scrape(url: string): Promise<{ title: string; image: string }> {
        this.logger.log(`Scraping URL (Human-like): ${url}`);
        let browser;
        try {
            browser = await (puppeteer as any).launch({
                headless: true,
                executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--window-size=1920,1080'
                ],
            });
            const page = await browser.newPage();

            // Set realistic headers
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
            });

            // networkidle2 is robust for redirects
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

            // Small random delay to feel "human"
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

            const data = await page.evaluate(() => {
                const getMeta = (p: string) => document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.getAttribute('content');

                // Airbnb-specific selectors
                const airbnbTitle = document.querySelector('h1[elementtiming="LCP-target"], h1#title_0, [data-testid="listing-title"]')?.textContent;

                // Booking-specific selectors
                const bookingTitle = document.querySelector('h1#hp_hotel_name, .pp-header__title, [data-testid="property-name"]')?.textContent;

                let title = airbnbTitle || bookingTitle || getMeta('og:title') || getMeta('twitter:title');

                // Cleanup title (remove site name suffixes)
                if (title) {
                    title = title.replace(/\s*-\s*Airbnb.*/gi, '')
                        .replace(/\s*-\s*Booking.com.*/gi, '')
                        .replace(/,\s*Booking.com.*/gi, '')
                        .trim();
                }

                if (!title || title.length < 3) title = document.title;

                let image = getMeta('og:image') || getMeta('twitter:image');

                // Fallback for image
                if (!image) {
                    const airbnbImg = document.querySelector('img[data-original-uri], [data-testid="pdp-gallery-image-0"] img')?.getAttribute('src');
                    if (airbnbImg) image = airbnbImg;

                    if (!image) {
                        const bookingImg = document.querySelector('.bh-photo-grid-item img, .hotel_main_content img')?.getAttribute('src');
                        if (bookingImg) image = bookingImg;
                    }
                }

                return { title, image };
            });

            this.logger.log(`Scraped: Title="${data.title}", Image="${data.image?.substring(0, 50)}..."`);
            return { title: data.title || '', image: data.image || '' };

        } catch (error) {
            this.logger.error(`Error scraping URL: ${error.message}`);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
