const feeds = [
  // Jobicy Feeds
  {
    url: "https://jobicy.com/?feed=job_feed",
    category: "General",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
    category: "SMM",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
    category: "Sales", // 'seller' implies sales
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
    category: "Design & Multimedia",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=data-science",
    category: "Data Science",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
    category: "Copywriting",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=business",
    category: "Business",
    source: "jobicy",
  },
  {
    url: "https://jobicy.com/?feed=job_feed&job_categories=management",
    category: "Management",
    source: "jobicy",
  },
  // HigherEdJobs (Now supported with browser headers and fallback proxy)
  {
    url: "https://www.higheredjobs.com/rss/articleFeed.cfm",
    category: "Education",
    source: "higheredjobs"
  }
];

module.exports = feeds;
