import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);

    async scrape(url: string): Promise<{ title: string; image: string }> {
        this.logger.log(`Scraping URL (Robust): ${url}`);
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--window-size=1280,800'
                ],
            });
            const page = await browser.newPage();

            // Soften resource blocking: allow CSS for better rendering/signals
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                if (['image', 'font', 'media'].includes(type)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            // networkidle2 is more robust for redirects (especially Booking.com Share links)
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

            const data = await page.evaluate(() => {
                const getMeta = (p: string) => document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.getAttribute('content');

                let title = getMeta('og:title') || getMeta('twitter:title');

                // If title is generic or missing, look for H1
                const genericTitles = ['airbnb', 'booking.com', 'holiday rentals', 'vacation rentals'];
                if (!title || genericTitles.some(t => title!.toLowerCase().includes(t) && title!.length < 20)) {
                    const h1 = document.querySelector('h1')?.innerText;
                    if (h1 && h1.length > 5) title = h1;
                }

                if (!title) title = document.title;

                let image = getMeta('og:image') || getMeta('twitter:image');

                // Fallback for image if OG is missing or low quality
                if (!image) {
                    const airbnbImg = document.querySelector('img[data-original-uri]')?.getAttribute('src');
                    if (airbnbImg) image = airbnbImg;
                }

                return { title, image };
            });

            this.logger.log(`Scraped (Robust): Title="${data.title}", Image="${data.image?.substring(0, 50)}..."`);
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
