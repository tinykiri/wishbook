import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    // 1. FAKE A REAL BROWSER (User-Agent Rotation)
    // Many sites block default scrapers. This pretends to be a real Mac user.
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- STRATEGY 1: JSON-LD (The Gold Standard) ---
    // Sites put this data here specifically for Google Shopping bots.
    let jsonLdData: any = {};
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        // We look for "Product" type specifically
        if (json["@type"] === "Product" || json["@type"] === "ItemPage") {
          jsonLdData = json;
        }
        // Handle arrays (sometimes they wrap multiple objects)
        if (Array.isArray(json)) {
          const product = json.find(j => j["@type"] === "Product");
          if (product) jsonLdData = product;
        }
      } catch (e) { /* ignore parse errors */ }
    });

    // Extract from JSON-LD
    let title = jsonLdData.name;
    let image_url = Array.isArray(jsonLdData.image) ? jsonLdData.image[0] : jsonLdData.image;
    let price = "";

    if (jsonLdData.offers) {
      const offer = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
      if (offer.price) {
        price = `${offer.priceCurrency || "$"} ${offer.price}`;
      }
    }

    // --- STRATEGY 2: META TAGS (The Social Fallback) ---
    // If JSON-LD failed, check Open Graph (Facebook) and Twitter Cards
    if (!title) {
      title = $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $('title').text().trim();
    }

    if (!image_url) {
      image_url = $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        $('meta[property="og:image:secure_url"]').attr("content");
    }

    if (!price) {
      // Sometimes price is in meta tags too
      const amount = $('meta[property="og:price:amount"]').attr("content") ||
        $('meta[property="product:price:amount"]').attr("content");
      const currency = $('meta[property="og:price:currency"]').attr("content") ||
        $('meta[property="product:price:currency"]').attr("content") || "$";
      if (amount) price = `${currency} ${amount}`;
    }

    // --- STRATEGY 3: VISUAL DETECTIVE (The "Desperate" Fallback) ---

    // 3A. Regex Price Hunter
    // Scans visible text for currency patterns like $19.99 or 19.99 USD
    if (!price) {
      const priceRegex = /([$€£¥]\s?\d{1,3}(,\d{3})*(\.\d{2})?)|(\d{1,3}(,\d{3})*(\.\d{2})?\s?(USD|EUR|GBP))/i;

      // Look in common price containers first
      const priceCandidates = $('.price, .product-price, .offer-price, #price, [data-test-id="price"]');

      if (priceCandidates.length > 0) {
        const match = priceCandidates.first().text().match(priceRegex);
        if (match) price = match[0];
      }

      // If still nothing, scan the whole body (risky, might grab random numbers)
      if (!price) {
        // limit to first 5000 chars to avoid footer junk
        const bodyText = $('body').text().substring(0, 5000);
        const match = bodyText.match(priceRegex);
        if (match) price = match[0];
      }
    }

    // 3B. Image Scorer
    // If we still have no image, find the largest image on the page
    if (!image_url) {
      let maxArea = 0;
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        // Ignore SVGs, data URIs, and tiny icons
        if (src && !src.startsWith('data:') && !src.endsWith('.svg')) {
          // We can't know real dimensions without downloading, but we can check HTML attributes
          const width = parseInt($(el).attr('width') || "0");
          const height = parseInt($(el).attr('height') || "0");
          const area = width * height;

          if (area > maxArea && area > 5000) { // must be at least thumbnail size
            maxArea = area;
            image_url = src;
          }
        }
      });
    }

    // --- FINAL CLEANUP ---
    // Fix relative URLs (e.g., "/images/pic.jpg" -> "https://site.com/images/pic.jpg")
    if (image_url && image_url.startsWith("/")) {
      const urlObj = new URL(url);
      image_url = `${urlObj.protocol}//${urlObj.host}${image_url}`;
    }

    return NextResponse.json({
      title: title?.trim() || "Cool Find",
      price: price?.trim() || "",
      image_url: image_url || "",
      product_url: url
    });

  } catch (error) {
    console.error("Scrape Error:", error);
    // Return empty success so UI doesn't crash, just lets user fill it in
    return NextResponse.json({
      title: "",
      price: "",
      image_url: "",
      error: "Failed to scrape"
    });
  }
}