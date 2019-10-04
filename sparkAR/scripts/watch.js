// this is just a super simple script to concatenate my "shared" script and my main SparkAR script

const fs = require('fs');

function joinFiles(){
    fs.writeFile('script.js', [
        fs.readFileSync('shared.js', 'utf8'),
        fs.readFileSync('main.js', 'utf8')
    ].join('\n'), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;
    
        // success case, the file was saved
        console.log('script.js saved!');
    });
}

fs.watchFile('shared.js', (curr, prev) => {joinFiles()});
fs.watchFile('main.js', (curr, prev) => {joinFiles()});

joinFiles();