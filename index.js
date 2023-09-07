const COC_API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjMxYWQ5ZGRhLWMzZDgtNDA4NC05ZjdmLTBkY2RiZGViMzYzMCIsImlhdCI6MTY5NDA0NTUwMCwic3ViIjoiZGV2ZWxvcGVyLzNkMTczMTUyLTJhYWQtMjE1Zi03ODJhLWExM2IwNWZjZDE5NSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE3NC45MS4xOTIuMTA3Il0sInR5cGUiOiJjbGllbnQifV19.zTCcPQFxgrooBSHUVBhu5smZr6uzXCqZepfHfMNMM4CtQEJLWh2hdVr3AvNmrx5fYgAhCAYSUKUNIsm4S2wtMQ"


const clashApi = require('clash-of-clans-api')
const fs = require('fs')

let client = clashApi({
  token: COC_API_TOKEN // Optional, can also use COC_API_TOKEN env variable
});


async function main()
{
    console.log(`checking new contributions ${new Date()}`)
    var contrib;

    try {
        contrib = JSON.parse(fs.readFileSync('contrib.json', 'utf8'));
    } 
    catch (err) {
        contrib = {}
    }

    try {
        log = JSON.parse(fs.readFileSync('log.json', 'utf8'));
    } 
    catch (err) {
        log = []
    }

    try {
        const claninfo = await client.clanByTag('#UGPJUOLP')


        for ( i of claninfo.memberList)
        {
            playerinfo = await client.playerByTag(i.tag)

            var oldvalue = contrib[playerinfo.name] ? contrib[playerinfo.name] : 0;
            var newvalue = playerinfo.clanCapitalContributions;
            if (oldvalue != newvalue) {
                console.log(playerinfo.name, newvalue - oldvalue);
                log.push({name: playerinfo.name, value: newvalue - oldvalue, date: new Date()})
            }
            
            contrib[playerinfo.name] = newvalue;
            
        }

        fs.writeFileSync('contrib.json', JSON.stringify(contrib, null, 4));
        fs.writeFileSync('log.json', JSON.stringify(log, null, 4));

        console.log('done')
        setTimeout(main, 1000 * 60 * 10 * 1);
    }
    catch (err) {
        console.log(err)
        setTimeout(main, 1000 * 60);
    }
}

main();