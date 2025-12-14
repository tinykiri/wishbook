import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- SCRAPING LOGIC ---
    let jsonLdData: any = {};
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        if (json["@type"] === "Product" || json["@type"] === "ItemPage") {
          jsonLdData = json;
        }
        if (Array.isArray(json)) {
          const product = json.find(j => j["@type"] === "Product");
          if (product) jsonLdData = product;
        }
      } catch (e) { /* ignore parse errors */ }
    });

    let title = jsonLdData.name;
    let image_url = Array.isArray(jsonLdData.image) ? jsonLdData.image[0] : jsonLdData.image;
    let price = "";

    if (jsonLdData.offers) {
      const offer = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
      if (offer.price) {
        price = `${offer.priceCurrency || "$"} ${offer.price}`;
      }
    }

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
      const amount = $('meta[property="og:price:amount"]').attr("content") ||
        $('meta[property="product:price:amount"]').attr("content");
      const currency = $('meta[property="og:price:currency"]').attr("content") ||
        $('meta[property="product:price:currency"]').attr("content") || "$";
      if (amount) price = `${currency} ${amount}`;
    }

    if (!price) {
      const priceRegex = /([$€£¥]\s?\d{1,3}(,\d{3})*(\.\d{2})?)|(\d{1,3}(,\d{3})*(\.\d{2})?\s?(USD|EUR|GBP))/i;

      const priceCandidates = $('.price, .product-price, .offer-price, #price, [data-test-id="price"]');

      if (priceCandidates.length > 0) {
        const match = priceCandidates.first().text().match(priceRegex);
        if (match) price = match[0];
      }

      // If still nothing, scan the whole body (might grab random numbers)
      if (!price) {
        const bodyText = $('body').text().substring(0, 5000);
        const match = bodyText.match(priceRegex);
        if (match) price = match[0];
      }
    }

    // If we still have no image, find the largest image on the page
    if (!image_url) {
      let maxArea = 0;
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('data:') && !src.endsWith('.svg')) {
          const width = parseInt($(el).attr('width') || "0");
          const height = parseInt($(el).attr('height') || "0");
          const area = width * height;

          if (area > maxArea && area > 5000) {
            maxArea = area;
            image_url = src;
          }
        }
      });
    }

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
    return NextResponse.json({
      title: "",
      price: "",
      image_url: "",
      error: "Failed to scrape"
    });
  }
}