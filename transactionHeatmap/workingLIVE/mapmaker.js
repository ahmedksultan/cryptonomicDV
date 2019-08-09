/* ----- QUERYING ----- */

const serverInfo = {
    url: 'https://conseil-dev.cryptonomic-infra.tech:443',
    apiKey: 'hooman'
};

/*
const serverInfo = {
    url: 'https://conseil-prod.cryptonomic-infra.tech:443',
    apiKey: 'galleon'
};
*/

async function getOperations(network, query) {
    const blocks = await conseiljs.TezosConseilClient.getOperations(serverInfo, network, query);
    output(blocks);
};

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

/* ----- MAPPING ----- */

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
    console.log(myMap);
    //creating the d3 dataset out of the map created through ConseilJS queries

    var dataset = [];
    var date = 1;

    while (date < 20) {
        var myAmount;
        if (date < 10) {
            //myAmount = myMap.get('2019-06-0' + date);
            myAmount = myMap.get('07/0' + date + '/2019');
        } else {
            //myAmount = myMap.get('2019-06-' + date);
            myAmount = myMap.get('07/' + date + '/2019');
        }
        dataset.push(myAmount);
        date++;
    }

console.log(dataset);

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


//creates rectangles for all #s in the dataset
var rectangles = canvas.selectAll(".rectangles")
    .data(dataset)
    .enter()
    .append("rect");

//xCor/aCor and yCor/bCor track day of week, and # of week
//(i.e. June 1st is 6, 0 (Saturday), june 2nd is 0, 1 etc.)
//starting off one less than actual because of the way the functions work & return
var xCor = 5;
var yCor = 0;

var aCor = 5;
var bCor = 0;

rectangles
    .attr("x", function (d) {
        xCor++;
        if (xCor == 7) {
            xCor = 0;
            yCor++;
        }
        return 15 + (xCor * 50);
    })
    .attr("y", function (d) {
        aCor++;
        if (aCor == 7) {
            aCor = 0;
            bCor++;
        }
        return 15 + (bCor * 50);
    })
    .attr("height", 40)
    .attr("width", 40)
    .attr("fill", function (d) {
        return myColor((d / 100000) * 10)
    });

canvas.append("text")
    .text('BRUH') //MONTH
    .attr("x", 15)
    .attr("y", 45)
    .attr("fill", "dodgerblue")

}