var watch = require('node-watch');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) { 
	if (stdout) { console.log(stdout); }
	if (stderr) { console.log(stderr); }
}

watch('src', function(filename) {
	console.log(filename, 'changed. Re-buildind...');
	exec("node build.js", puts);  
});
