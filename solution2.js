
let axios = require("axios");
let cheerio = require("cheerio");

let baseUrl = "https://en.wikipedia.org";
let testUrl = "https://en.wikipedia.org/wiki/Footloose_(1984_film)";
let testUrl2 = "https://en.wikipedia.org/wiki/Tom_Cruise";
let targetUrl = "https://en.wikipedia.org/wiki/Kevin_Bacon";
let maxDepth = 2;

class LinkTree {
    constructor(url){
        this.root = new LinkNode(url);
    }

    async init(){
        await this.root.init();
    }

    search(targetUrl){
        let result = this.root.search(targetUrl);
        return result;
    }

}

class LinkNode {
    constructor(url, depth = 0){
        this.url = url;
        this.depth = depth;
        this.children = [];
        // console.log(`depth: ${depth}, url: ${this.url}`)
    }

    // Intialize this LinkNode with all its child links
    // which are also LinkNodes. If maxdepth is reached, 
    // leave node children as empty return 0
    async init(){
        if (this.depth >= maxDepth){
            return 0;
        }
        let $ = await fetchData(this.url);
        this.children = await this.getChildLinks($);
    }

    // Returns a list of LinkNodes based on the html
    // passed in via $. LinkNodes have url for valid 
    // hrefs found in <a> tags
    async getChildLinks($){
        let links = $('a');
        let linkNodes = []
        for (let count in links){
            let link = links[count];
            let linkUrl = getLinkUrl(link);
            if (linkUrl){
                let linkNode = new LinkNode(linkUrl, this.depth + 1);
                await linkNode.init();
                linkNodes.push(linkNode);
            }
        } 
        return linkNodes;
    }


    search(targetUrl){
        // First check immediate children
        for (let i in this.children){
            let childNode = this.children[i];
            if (childNode.url == targetUrl){
                return childNode.depth;
            }
        }

        // Now check childrens children
        for (let i in this.children){
            let childNode = this.children[i];
            let result = childNode.search(targetUrl);
            if (result){
                return result
            }
        }
        return false;
    }

}





let getLinkUrl = function(link){
    if (typeof(link) == "object" && "attribs" in link){
        if ("href" in link["attribs"]){
            if (link["attribs"]["href"].startsWith('/wiki/')){
                let url = `${baseUrl}${link["attribs"]["href"]}`;
                return url;
            }
        }
    }
    return false;
}

let fetchData = async function(url) {
    let result = await axios.get(url);
    return cheerio.load(result.data);
};

let findKevinBacon = async function(url){
    let tree = new LinkTree(url);
    console.log('building link tree...')
    await tree.init();
    console.log('tree built!')
    console.log(`searching for this page ${targetUrl} starting from this page ${url}`)
    let result = tree.search(targetUrl);
    console.log(`kevin page was found ${result} links away from ${url}`);

}


findKevinBacon(testUrl);
findKevinBacon(testUrl2);
