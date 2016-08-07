var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app     = express();
var exec = require('child_process').exec;
const username = require('username');
 
var songsDir;
username().then(username => {
    songsDir = `/home/${username}/Music`;
});

app.use(bodyParser.urlencoded({ extended: true })); 

app.set('view engine', 'jade');
app.set('views', './views');

app.get('/', function (req, res) {
	res.render('index', { songs: getFilesRecursive(songsDir) });
});

app.get('/sleep', function (req, res) {
	if (req.query.time) {	
		exec("sudo rtcwake -m mem -s " + req.query.time);
	}

	if (req.query.song) {
		exec(`find ${songsDir} -type f -name '${req.query.song}'` , function (error, stdout) {
			exec(`clementine '${stdout}'`);
		});
	}
	res.end();
});

app.listen(8080, function () {
  console.log('Server running at http://127.0.0.1:8080/');
});


// https://gist.github.com/ashblue/3916348
function getFilesRecursive (folder) {
    var fileContents = fs.readdirSync(folder),
        fileTree = [],
        stats;

    fileContents.forEach(function (fileName) {
        stats = fs.lstatSync(folder + '/' + fileName);

        if (stats.isDirectory()) {
            var obj = {};
            obj.name = fileName;
            obj.songs = getFilesRecursive(folder + '/' + fileName);
            fileTree.push(obj);
        } else {
            fileTree.push(fileName);
        }
    });

    return fileTree;
};
