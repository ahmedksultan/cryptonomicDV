const serverInfo = {
    url: 'https://conseil-dev.cryptonomic-infra.tech:443',
    apiKey: 'hooman'
};

/* mainnet
const serverInfo = {
    url: 'https://conseil-prod.cryptonomic-infra.tech:443',
    apiKey: 'galleon'
};
*/ 

async function getOperations(network, query) {
    const blocks = await conseiljs.TezosConseilClient.getOperations(serverInfo, network, query);
    output(blocks);
}

function output(blocks = []) {
    var myMap = new Map();
    blocks.map((block, index) => {
        var time = new Date(block.timestamp);
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        var time = time.toLocaleDateString("en-US", options);
        var amnt = block.amount;

        if (myMap.has(time)) {
            myMap.set(time, myMap.get(time) + (amnt / 1000000.0));
        } else {
            myMap.set(time, (amnt / 1000000.0));
        }
    });
    console.log(myMap)
}

function onClickGo() {
    let amountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    amountQuery = conseiljs.ConseilQueryBuilder.addFields(amountQuery, 'timestamp', 'amount');
    
    // 1561953600000,1564632000000 (july 1 - august 1)
    amountQuery = conseiljs.ConseilQueryBuilder.addPredicate(amountQuery, 'timestamp', conseiljs.ConseilOperator.BETWEEN, [1561953600000, 1564632000000], false);
    amountQuery = conseiljs.ConseilQueryBuilder.addPredicate(amountQuery, 'kind', conseiljs.ConseilOperator.EQ, ["transaction"], false);
    amountQuery = conseiljs.ConseilQueryBuilder.addOrdering(amountQuery, 'timestamp', conseiljs.ConseilSortDirection.ASC);
    amountQuery = conseiljs.ConseilQueryBuilder.addPredicate(amountQuery, 'amount', conseiljs.ConseilOperator.GT, [0]);
    amountQuery = conseiljs.ConseilQueryBuilder.setLimit(amountQuery, 10000);

    //when transitioning to mainnet, switch field
    getOperations('alphanet', amountQuery);
}

async function fetchMetadata() {
    const platformResult = await conseiljs.ConseilMetadataClient.getPlatforms(serverInfo);
    const platform = platformResult[0]['name'];
    const networksResult = await conseiljs.ConseilMetadataClient.getNetworks(serverInfo, platform);
    const network = networksResult[0]['name'];
    const entityResult = await conseiljs.ConseilMetadataClient.getEntities(serverInfo, platform, network);
    const blocks = Array.from(entityResult).filter(v => v['name'] === 'blocks')[0]['name'];
    const attributeResult = await conseiljs.ConseilMetadataClient.getAttributes(serverInfo, platform, network, blocks);
}

document.onreadystatechange = () => {
    if (document.readyState === 'complete') { fetchMetadata(); }
}

//canvas is an SVG file in which the calendar is drawn
var canvas = d3.select("body").append("svg")
    .attr("width", 400)
    .attr("height", 310)

//myColor is a pre-made palette from COLORBREW that is compatible with d3
var myColor = d3.scale.quantize()
    .range(colorbrewer.Blues[9])
    .domain([0, 10]);

//colors canvas #F0F0F0 to ensure better visibility
canvas.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#F0F0F0");