const axios = require('axios')
const qs = require('querystring')
const Promise = require('bluebird')
const cheerio = require('cheerio')
const _ = require('lodash')

const {writeToDb } = require('./fire');


axios.defaults.validateStatus = function () {
    return true;
};
axios.defaults.baseURL = 'https://thepointsguy.com';

  const MAX_PAGES_EXPRIMENT = false;
  const MAX_CONCURRENCY = 20;

  const lidMap = {};
  const pidMap = {};
  function makePidMap(capiCards) {
    capiCards.forEach(card => {
      const lid = card.attributes.link.replace(
        "https://oc.brcclx.com/t?lid=",
        ""
      );
      lidMap[lid] = card;
      pidMap[card.attributes.legacyId] = card;
    });
  }

  // similar, we're just making a map of issuer ID -> issuer name, for presentation sake.
  const issuerMap = {};
  function makeIssuerMap(included) {
    included.forEach(obj => {
      if (obj.type == "issuer") {
        issuerMap[obj.id] = obj.attributes.name;
      }
    });
  }
  objectsToWrite = {};
  const link2LidMap = require("./link2LidMap.json");
  const link2CardQueue = new Map();
  function link2card(link, callback) {
    let _lid = link2LidMap[link];
    if (_lid) {
      const card = lidMap[_lid];
      callback(card);
    } else if (link2CardQueue.has(link)) {
      link2CardQueue.get(link).push(callback);
    } else {
      link2CardQueue.set(link, [callback]);
      try {
      axios.get(encodeURI(link)).then(response => {
        if (response.data) {
          //regex to parse values
          let lid = "";
          let pid = "";
          let unavailable = "";

          try {
            const re = /oc\.brcclx\.com\/t\/\?lid=(\d+)/;
            lid = _.get(response.data.match(re), "[1]", null);
            const re2 = /data\-product\-id=\"(\d+)\"/;
            pid = _.get(response.data.match(re2), "[1]", null);
            const re3 = /(Offer\ Unavailable)/;
            unavailable = _.get(response.data.match(re3), "[1]", null);
          }
          catch (e) {
            console.log(`unable to parse regex values for ${response.data}`)
          }
          if (unavailable) {
            let offerUnavailable = {
              url: link,
              product_id: "Offer Unavailable"
            };
            const waiting = link2CardQueue.get(link);
            waiting.forEach(cb => cb(offerUnavailable));
          }
          if (lid) {
            link2LidMap[link] = lid;
            callback(lidMap[lid]);
            const waiting = link2CardQueue.get(link);
            waiting.forEach(cb => cb(lidMap[lid]));
            link2CardQueue.delete(link);
          }
          if (pid) {
            if (Object.keys(pidMap[pid]).length > 0) {
              //console.log("got pid" + pid)
              const waiting = link2CardQueue.get(link);
              waiting.forEach(cb => cb(pidMap[pid]));
              link2CardQueue.delete(link);
            }
          } else {
            callback(null);
            const waiting = link2CardQueue.get(link);
            if (waiting) waiting.forEach(cb => cb(null));
          }
        }
        });
        }catch (e)  {}
      }
    
  }

  function contains(href, searchValue) {
    if (href.indexOf(searchValue) > 0) {
      return true;
    } else {
      return false;
    }
  }

  // here's the work of scraping an individual post from the API.
  function processPage(response) {
    const unknown = "UNKNOWN";
    const posts = response.data;
    //console.log(posts)
    if (posts.length > 0) {
      posts.forEach(p => {
        const $ = cheerio.load(p.content.rendered);
        $(".card-feature").remove(); // not looking for card feature links.
        $("a").each((inx, link) => {
          const href = link.attribs.href;
          if (
            href &&
            (contains(href, "apply-now") ||
              contains(href, ".com/apply/") ||
              contains(href, "/card-hub") ||
              contains(href, "card-details"))
          ) {
            const table = contains(href, "card-details") ? "reviews" : "cards";
            const url = p.link;
            const product_id = link.attribs["data-product-id"];
            const link_text = link.firstChild.nodeValue;
            const target = link.attribs.href;
            const last_modified = p.modified;
            if (product_id) {
              const card = pidMap[product_id];
              const card_name = _.get(card, "attributes.name", unknown);
              const issuerId = _.get(card, "relationships.issuer.data.id", unknown);
              const issuer = _.get(issuerMap, issuerId, issuerId);
              writeToDb(table, {
                url,
                product_id,
                card_name,
                issuer,
                last_modified,
                target,
                link_text
              });
          
            } else {
              link2card(target, card => {
                if (card) {
                  if (card.product_id && card.product_id == "Offer Unavailable") {
                    writeToDb("unavailable", {
                      url,
                      product_id: "Offer Unavailable",
                      card_name: "",
                      last_modified,
                      target,
                      link_text
                    });
               
                  } else {
                    const pid = card.attributes.legacyId;
                    const card_name = card.attributes.name;
                    const issuer = issuerMap[card.relationships.issuer.data.id];
                    writeToDb(table, {
                    url,
                    product_id: pid,
                    card_name,
                    issuer,
                    last_modified,
                    target,
                    link_text
                    });
          
                  }
                } else {
                writeToDb(table, {
                  url,
                  product_id: unknown,
                  card_name: unknown,
                  issuer: "",
                  last_modified,
                  target,
                  link_text
                  });
             
                }
              });
            }
          }
        });
      });
    }
  }

  // borrowed from TPG UK. An HTTP get that retries itself recursively 3 times before giving
  // up, unless it receives a 401 or 404 status code.
  async function retryableGet(reqUrl, allowedRetries = 3, retried = 0) {
    if (allowedRetries === retried) {
      console.error(`Exceeded allowed retries on ${reqUrl}`);
      // throw new Error('Max retries exceeded on requests.')
      return null;
    }
    if (retried) {
      await Promise.delay(100);
    }
    let out;
    try {
      out = await axios.get(reqUrl);
    } catch (e) {
      const status = _.get(e, "response.status", null);
      if (status) {
        console.log("status" + status)
      }
      if (status === 401) {
        console.error(`401 status for ${reqUrl}`);
      } else if (status === 404) {
        console.error(`404 status for ${reqUrl}`);
      } else {
        return retryableGet(reqUrl, allowedRetries, retried + 1);
      }
    }
    return out;
  }

  async function getListOfEntities(endpoint) {
    // fetch the capi feed and make our necessary lid/pid/card data and issuer name mappings.
    let timeNow = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
    let timeObj = {
      time: timeNow
    }
    writeToDb('updated', timeObj )
    console.log("cleared")
    const capiFeed = await retryableGet(
      "https://api.creditcards.com/v2/cards?apiKey=B67122EC-4476-47AC-877A-910111070B88"
    );
    makePidMap(capiFeed.data.data);
    makeIssuerMap(capiFeed.data.included);

    const order = "asc";
    const per_page = 20;

    console.log(`Fetching ${endpoint}...`);
    // grab the first page of posts.
    const uri = `${endpoint}?${qs.stringify({ per_page, page: 1, order })}`;
    const first = await retryableGet(uri);

    processPage(first);

    // determine how many subsequent pages there are to fetch.
    const totalPages = Number(first.headers["x-wp-totalpages"]);
    const maxToFetch = MAX_PAGES_EXPRIMENT
      ? _.min([MAX_PAGES_EXPRIMENT, totalPages])
      : totalPages;
    const pagesToFetch = _.range(2, maxToFetch + 1);

    console.log(`${endpoint}: 1 of ${maxToFetch}`);


    
    await Promise.map(
      pagesToFetch,
      async (page, inx) => {
        console.log(`${endpoint}: ${inx + 2} of ${maxToFetch}`);
        const uri = `${endpoint}?${qs.stringify({ per_page, page, order })}`;
        const response = await retryableGet(uri);
        return processPage(response);
      },
      { concurrency: MAX_CONCURRENCY }
    );
    return true
    //disconnect();

  }


//cloud functions
async function test () {
  let completed =""
    await getListOfEntities("https://thepointsguy.com/wp-json/wp/v2/guide").then(async res => {
       completed = true
    })
    //const completed = await getListOfEntities("https://thepointsguy.com/wp-json/wp/v2/posts") 
    return (completed)
}

exports.crawl = async(req, res) => {
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')
  const completed = ""; 

  await getListOfEntities("https://thepointsguy.com/wp-json/wp/v2/guide")

    return res.status(200).send(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
 }

test()
