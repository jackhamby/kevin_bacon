let axios = require("axios");
let cheerio = require("cheerio");

let baseUrl = "https://en.wikipedia.org"
let testUrl = "https://en.wikipedia.org/wiki/Footloose_(1984_film)";
let testUrl2 = "https://en.wikipedia.org/wiki/Tom_Cruise";
let destUrl = "https://en.wikipedia.org/wiki/Kevin_Bacon";



let urlQueue = [];

let findBacon = async function(startingUrl){
    urlQueue.push([0, startingUrl]);
    while(urlQueue.length > 0){
        let queueData = urlQueue.shift();
        let urlLinkDistance = queueData[0];
        let urlToProcess = queueData[1];
        let nextUrls = await getUrls(urlToProcess, urlLinkDistance + 1);
        // We found Bacon
        if (typeof(nextUrls) == "number"){
            urlQueue = [];
            return nextUrls;
        }
        // Keep looking
        else{
            urlQueue = urlQueue.concat(nextUrls);
        }
    }
}

let fetchData = async function(url) {
    let result = await axios.get(url);
    return cheerio.load(result.data);
};

let getUrls = async function(url, linkDistance = 0){
    let $ = await fetchData(url);
    let links = $('a');
    let urls = []; 
    for (let count in links){
        let link = links[count];
        try{
            let href = link["attribs"]["href"];
            if (href.startsWith('/wiki/')){
                let url = `${baseUrl}${href}`;
                if (url == destUrl){
                    return linkDistance;
                }
                else{
                    urls.push([linkDistance, url]);
                }
            }
        }
        catch{
            // No href avaible in a tag
        }
    } 
    return urls;
}


let run = async function(){
    let linksToBacon = await findBacon(testUrl);
    console.log(`It takes ${linksToBacon} links to find kevin bacon from ${testUrl}`);
    linksToBacon = await findBacon(testUrl2);
    console.log(`It takes ${linksToBacon} links to find kevin bacon from ${testUrl2}`);

}

run();

