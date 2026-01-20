const axios = require("axios");
const xml2js = require("xml2js");

/**
 * Fetches XML from a URL and parses it to JSON.
 * @param {string} url - The URL of the XML feed.
 * @returns {Promise<{validJobs: Array, failedJobs: Array}>} - A promise that resolves to an object with valid and failed jobs.
 */
const fetchAndParseFeed = async (url, defaultCategory = "General") => {
  try {
    console.log(`Fetching feed from: ${url}`);
    
    // Browser-like headers to avoid bot blocking (especially for HigherEdJobs)
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": url.includes("higheredjobs") ? "https://www.higheredjobs.com/" : undefined,
    };

    let xmlData;
    try {
      // Try direct fetch first
      const response = await axios.get(url, { 
        headers,
        timeout: 15000 
      });
      xmlData = response.data;
      
      // Validate it's actually RSS/XML content
      if (typeof xmlData === 'string' && !xmlData.includes('<rss') && !xmlData.includes('<?xml')) {
        throw new Error('Not RSS - likely blocked by source');
      }
    } catch (directError) {
      console.warn(`Direct fetch failed for ${url}, trying proxy fallback:`, directError.message);
      
      // Fallback: Use proxy for blocked sources
      const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyResponse = await axios.get(proxiedUrl, { timeout: 20000 });
      xmlData = proxyResponse.data;
      
      // Validate proxy response
      if (typeof xmlData === 'string' && !xmlData.includes('<rss') && !xmlData.includes('<?xml')) {
        throw new Error('Proxy also returned non-RSS content - source may be blocking all requests');
      }
      console.log(`✅ Successfully fetched via proxy for ${url}`);
    }

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    // Identify the structure. Usually simpler RSS feeds have channel.item
    // Adjust this based on the actual XML structure of jobicy
    // Example Jobicy structure: <rss><channel><item>...</item></channel></rss>
    const items = result.rss?.channel?.item || [];

    // standardized format
    const validJobs = [];
    const failedJobs = [];

    (Array.isArray(items) ? items : [items]).forEach((item) => {
       // Attempt to parse category from feed if available, otherwise use default
       const feedCategory = item.category || item["job_listing:category"];
       const finalCategory = feedCategory || defaultCategory;

       const jobId = item.guid?._ || item.guid || item.id || item.link;
       const title = item.title;
       const company = item["job_listing:company"] || item.company || "Unknown";

       // Validation: Check for required fields
       if (!jobId || !title) {
         failedJobs.push({
            jobId: jobId || "unknown",
            reason: "Missing required fields: jobId or title"
         });
         return;
       }

       validJobs.push({
        jobId, // guid is object with _ text or string
        title,
        company,
        location: item["job_listing:location"] || item.location || "Remote",
        description: item.description,
        jobType: item["job_listing:job_type"] || item.jobType,
        publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        url: item.link,
        source: "jobicy",
        category: finalCategory,
        salary: item["job_listing:salary"] || item.salary, // Attempt to parse salary if exists
      });
    });

    console.log(`Parsed ${validJobs.length} valid jobs, ${failedJobs.length} failed jobs.`);
    return { validJobs, failedJobs };
  } catch (error) {
    console.error(`Error fetching/parsing feed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  fetchAndParseFeed,
};
