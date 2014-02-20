/*
 * Google Profile Information Fun
*/

/*
 * Require Libraries
*/
var http	= require('http');
var url		= require('url');
var fs		= require('fs');
var zlib 	= require('zlib'); 
var locRegex = new RegExp("<loc>(.*?)</loc>","gi");
var packages = [];

/*
 * Starting Link
*/
var baseOptions = {
	host : 'www.gstatic.com',
	port : 80,
	path : '/s2/sitemaps/profiles-sitemap.xml'
};

http.get(baseOptions, function(response){
	if(response.statusCode != 200)
	{
		console.error("Initial stack was not found");
		process.exit();
	};
	
	var stack = '';
	response.on('data', function(chunk){
		stack += chunk;
	});

	response.on('end', function(){
		var match = null;

		while(match = locRegex.exec(stack))
		{
			packages.push(match[1]);
		}

		processPackages();
	});
}).on('error', function(e) {
    console.log("Got error<getting base>: " + e.message);
});

var processPackages = function()
{
	var totalPackages = packages.length;
	for(var i = 0; i < packages.length; i++)
	{
		var requestOptions = url.parse(packages[i]);

		(function(index){ //Do not use i inside thise scope.. noob
			http.get(requestOptions, function(response){
				if(response.statusCode != 200)
				{
					console.log("failed to get package form google");
					return;
				}

				response.pipe(zlib.createGunzip()).pipe(fs.createWriteStream("./data/segment_" + index + ".txt"));
				console.log("Piping " + index + " of " + totalPackages * index + " into ./data/segment_" + index + ".txt");
			}).on('error', function(e) {
    console.log("Got error<getting packages>: " + e.message);
});
		})(i);
	}
}
