import seedUsaUk from "./seed-usa-uk.json";

export const COUNTRIES = ["USA", "UK", "Australia", "Canada", "UAE", "Saudi Arabia", "Pakistan", "India"];
export const COUNTRY_TARGETS = { USA: 1000, UK: 500, Australia: 300, Canada: 300, UAE: 100, "Saudi Arabia": 100, Pakistan: 200, India: 200 };

export const NICHE_CATEGORIES = [
  "All Niches",
  "Home Services & Contractors",
  "Legal & Attorneys",
  "Healthcare & Dental",
  "Real Estate",
  "Automotive",
  "Restaurants & Food",
  "Finance & Insurance",
  "B2B & Technology",
  "Retail & Shopping",
  "General",
];

const CURATED = [
  // Australia
  { name: "Yellow Pages Australia", website_url: "https://www.yellowpages.com.au", add_url: "https://www.yellowpages.com.au", country: "Australia" },
  { name: "TrueLocal", website_url: "https://www.truelocal.com.au", add_url: "https://www.truelocal.com.au", country: "Australia" },
  { name: "Yelp Australia", website_url: "https://www.yelp.com.au", add_url: "https://biz.yelp.com.au", country: "Australia" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Australia" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Australia" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Australia" },
  { name: "Hotfrog Australia", website_url: "https://www.hotfrog.com.au", add_url: "https://www.hotfrog.com.au", country: "Australia" },
  { name: "LocalSearch", website_url: "https://www.localsearch.com.au", add_url: "https://www.localsearch.com.au", country: "Australia" },
  { name: "White Pages Australia", website_url: "https://www.whitepages.com.au", add_url: "https://www.whitepages.com.au", country: "Australia" },
  { name: "StartLocal", website_url: "https://www.startlocal.com.au", add_url: "https://www.startlocal.com.au", country: "Australia" },
  { name: "AussieWeb", website_url: "https://www.aussieweb.com.au", add_url: "https://www.aussieweb.com.au", country: "Australia" },
  { name: "dLook", website_url: "https://www.dlook.com.au", add_url: "https://www.dlook.com.au", country: "Australia" },
  // Canada
  { name: "YellowPages.ca", website_url: "https://www.yellowpages.ca", add_url: "https://www.yellowpages.ca", country: "Canada" },
  { name: "411.ca", website_url: "https://www.411.ca", add_url: "https://www.411.ca", country: "Canada" },
  { name: "Canpages", website_url: "https://www.canpages.ca", add_url: "https://www.canpages.ca", country: "Canada" },
  { name: "Yelp Canada", website_url: "https://www.yelp.ca", add_url: "https://biz.yelp.ca", country: "Canada" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Canada" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Canada" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Canada" },
  { name: "Hotfrog Canada", website_url: "https://www.hotfrog.ca", add_url: "https://www.hotfrog.ca", country: "Canada" },
  { name: "Cylex Canada", website_url: "https://www.cylex-canada.ca", add_url: "https://www.cylex-canada.ca", country: "Canada" },
  { name: "Brownbook Canada", website_url: "https://www.brownbook.net", add_url: "https://www.brownbook.net", country: "Canada" },
  { name: "MapQuest", website_url: "https://www.mapquest.com", add_url: "https://www.mapquest.com", country: "Canada" },
  { name: "Foursquare", website_url: "https://foursquare.com", add_url: "https://foursquare.com", country: "Canada" },
  // UAE
  { name: "Yellow Pages UAE", website_url: "https://www.yellowpages.ae", add_url: "https://www.yellowpages.ae", country: "UAE" },
  { name: "Yelp UAE", website_url: "https://www.yelp.ae", add_url: "https://biz.yelp.ae", country: "UAE" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "UAE" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "UAE" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "UAE" },
  { name: "Hotfrog UAE", website_url: "https://www.hotfrog.ae", add_url: "https://www.hotfrog.ae", country: "UAE" },
  { name: "Connect.ae", website_url: "https://connect.ae", add_url: "https://connect.ae", country: "UAE" },
  { name: "Yalwa UAE", website_url: "https://uae.yalwa.com", add_url: "https://uae.yalwa.com", country: "UAE" },
  // Saudi Arabia
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Saudi Arabia" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Saudi Arabia" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Saudi Arabia" },
  { name: "Google Business Profile", website_url: "https://business.google.com", add_url: "https://business.google.com/create", country: "Saudi Arabia" },
  { name: "Daleeli", website_url: "https://www.daleeli.com", add_url: "https://www.daleeli.com", country: "Saudi Arabia" },
  { name: "Saudi Yellow Pages", website_url: "https://www.saudiyellowpages.com", add_url: "https://www.saudiyellowpages.com", country: "Saudi Arabia" },
  // Pakistan
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "Pakistan" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "Pakistan" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "Pakistan" },
  { name: "Google Business Profile", website_url: "https://business.google.com", add_url: "https://business.google.com/create", country: "Pakistan" },
  { name: "Pakistan Yellow Pages", website_url: "https://www.yellowpages.com.pk", add_url: "https://www.yellowpages.com.pk", country: "Pakistan" },
  { name: "BusinessList Pakistan", website_url: "https://www.businesslist.pk", add_url: "https://www.businesslist.pk", country: "Pakistan" },
  // India
  { name: "JustDial", website_url: "https://www.justdial.com", add_url: "https://www.justdial.com", country: "India" },
  { name: "IndiaMART", website_url: "https://www.indiamart.com", add_url: "https://www.indiamart.com", country: "India" },
  { name: "Sulekha", website_url: "https://www.sulekha.com", add_url: "https://www.sulekha.com", country: "India" },
  { name: "Yellow Pages India", website_url: "https://www.yellowpages.co.in", add_url: "https://www.yellowpages.co.in", country: "India" },
  { name: "Yelp India", website_url: "https://www.yelp.in", add_url: "https://biz.yelp.in", country: "India" },
  { name: "Bing Places", website_url: "https://www.bingplaces.com", add_url: "https://www.bingplaces.com", country: "India" },
  { name: "Apple Business Connect", website_url: "https://businessconnect.apple.com", add_url: "https://businessconnect.apple.com", country: "India" },
  { name: "Facebook Business", website_url: "https://business.facebook.com", add_url: "https://www.facebook.com/pages/create", country: "India" },
  { name: "Hotfrog India", website_url: "https://www.hotfrog.in", add_url: "https://www.hotfrog.in", country: "India" },
  { name: "Grotal", website_url: "https://www.grotal.com", add_url: "https://www.grotal.com", country: "India" },
];

export const SEED_DIRECTORIES = [
  ...seedUsaUk.map((d) => ({ ...d, type: d.type || "Free", is_custom: false })),
  ...CURATED.map((d, i) => ({ id: `cur-${d.country}-${i}`, ...d, da: null, type: "Free", category: "", is_custom: false })),
];
