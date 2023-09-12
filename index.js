const COC_API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjMxYWQ5ZGRhLWMzZDgtNDA4NC05ZjdmLTBkY2RiZGViMzYzMCIsImlhdCI6MTY5NDA0NTUwMCwic3ViIjoiZGV2ZWxvcGVyLzNkMTczMTUyLTJhYWQtMjE1Zi03ODJhLWExM2IwNWZjZDE5NSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE3NC45MS4xOTIuMTA3Il0sInR5cGUiOiJjbGllbnQifV19.zTCcPQFxgrooBSHUVBhu5smZr6uzXCqZepfHfMNMM4CtQEJLWh2hdVr3AvNmrx5fYgAhCAYSUKUNIsm4S2wtMQ"
const http = require('http')
const fs = require('fs');
const path = require('path');

const clashApi = require('clash-of-clans-api')


let client = clashApi({
  token: COC_API_TOKEN // Optional, can also use COC_API_TOKEN env variable
});

function server()
{
    const server = http.createServer((req, res) => {
        // Get the current directory
        const currentDirectory = process.cwd();
      
        // Get the requested file path
        const filePath = path.join(currentDirectory, req.url);
      
        // Check if the requested file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // The file does not exist, return a 404 response
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          } else {
            // Read and serve the file
            fs.readFile(filePath, (err, data) => {
              if (err) {
                // Error reading the file, return a 500 response
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
              } else {
                // Determine the content type based on file extension
                const ext = path.extname(filePath);
                let contentType = 'text/plain';
                if (ext === '.html') contentType = 'text/html';
                else if (ext === '.css') contentType = 'text/css';
                else if (ext === '.js') contentType = 'text/javascript';
      
                // Set the appropriate content type and serve the file
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
              }
            });
          }
        });
      });
      
      const port = 3000;
      server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
      });

}

function publish()
{
    const cron = require('node-cron');
    const { exec } = require('child_process');

    const task = cron.schedule('0 */4 * * *', () => {
      const batchFilePath = 'update.bat';


      exec(`cmd /c ${batchFilePath}`, (error, stdout, stderr) => {
          if (error) {
          console.error(`Error executing batch file: ${error}`);
          return;
          }
          console.log(`Batch file executed successfully. Output:\n${stdout}`);
      });
    });

    task.start();
}


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

            if (contrib[playerinfo.name] != undefined) { // new user

                var oldvalue = contrib[playerinfo.name] ? contrib[playerinfo.name] : 0;
                var newvalue = playerinfo.clanCapitalContributions;
                if (oldvalue != newvalue) {
                    console.log(playerinfo.name, newvalue - oldvalue);
                    log.push({name: playerinfo.name, value: newvalue - oldvalue, date: new Date()})
                }
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

server();
publish();
main();