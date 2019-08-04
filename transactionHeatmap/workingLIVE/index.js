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
}

function output(blocks = []) {
    var myMap = new Map();
    blocks.map((block, index) => {
        var time = new Date(block.timestamp).toLocaleString().substring(0, 8);
        var amnt = block.amount;
        var level = block.block_level

        if (myMap.has(time)) {
            myMap.set(time, myMap.get(time) + (amnt / 1000000.0));
        } else {
            myMap.set(time, (amnt / 1000000.0));
        }
        document.writeln('(' + level + ') ' + amnt + ' ' + time + ' / ' );
    });
    console.log(myMap);
}

function onClickGo() {
    let amountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    amountQuery = conseiljs.ConseilQueryBuilder.addFields(amountQuery, 'block_level', 'timestamp', 'amount');
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