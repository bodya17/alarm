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

app.get('/play', function (req, res) {
	console.log('Play');
	res.end();
	if (typeof req.query.song === 'object') {
		req.query.song.forEach(function (song) {
			exec(`find ${songsDir} -type f -name '${song}'` , function (error, stdout) {
				exec(`clementine '${stdout}'`);
			});
		}); 
	} else {
		exec(`find ${songsDir} -type f -name '${req.query.song}'` , function (error, stdout) {
			exec(`clementine '${stdout}'`);
		});
	}
});

app.get('/prev', function (req, res) {
	res.end();
	exec("clementine -r");
});

app.get('/next', function (req, res) {
	res.end();
	exec("clementine -f");
});

app.get('/toggle', function (req, res) {
	res.end();
	exec("clementine -t");
});

app.get('/down', function (req, res) {
	res.end();
	exec("clementine --volume-down");
});

app.get('/up', function (req, res) {
	res.end();
	exec("clementine --volume-up");
});

app.get('/max', function (req, res) {
	res.end();
	exec("clementine -v 100");
});

app.get('/min', function (req, res) {
	res.end();
	console.log('min');
	exec("clementine -v 0");	
});

app.get('/sleep', function (req, res) {
	res.end();
	exec("sudo rtcwake -m mem -s " + req.query.time);
	exec(`find ${songsDir} -type f -name '${req.query.song}'` , function (error, stdout) {
		exec(`clementine '${stdout}'`);
	});
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
