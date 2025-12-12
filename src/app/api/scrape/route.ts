import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // 1. Fetch the HTML
    // We pretend to be a browser so Amazon doesn't block us immediately
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) throw new Error("Could not fetch site");

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Extract Data using "Meta Tags" (The standard way)
    // Most sites (Amazon, Etsy, Shopify) put the image/title here for Facebook sharing.
    let title = $('meta[property="og:title"]').attr("content") || $('title').text();
    let image_url = $('meta[property="og:image"]').attr("content");
    let price = "";

    // 3. Try to find the Price (The tricky part)
    // Method A: Look for "og:price:amount" (Standard)
    const priceMeta = $('meta[property="og:price:amount"]').attr("content");
    const currencyMeta = $('meta[property="og:price:currency"]').attr("content") || "$";

    if (priceMeta) {
      price = `${currencyMeta} ${priceMeta}`; // e.g., "$ 19.99"
    }
    // Method B: Look for JSON-LD (Google Shopping Data) - Common on big sites
    else {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || "{}");
          // If the JSON describes a Product with a Price offer
          if (json["@type"] === "Product" && json.offers) {
            const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
            if (offer.price) {
              price = `${offer.priceCurrency || "$"} ${offer.price}`;
            }
          }
        } catch (e) {
          // ignore broken json
        }
      });
    }

    // Fallback: If image is relative (starts with /), make it absolute
    if (image_url && image_url.startsWith("/")) {
      const urlObj = new URL(url);
      image_url = `${urlObj.protocol}//${urlObj.host}${image_url}`;
    }

    return NextResponse.json({
      title: title || "Unknown Product",
      price: price || "", // Send empty string if we can't find it
      image_url: image_url || "", // User can upload their own if missing
      product_url: url
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to scrape" }, { status: 500 });
  }
}