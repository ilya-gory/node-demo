/**
 * HTTP server serves static files
 * placed in `static` directory
 */

const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');

// port to listen
const PORT = 1337;
// default content-type header value for response
const MIME_DEFAULT = 'application/octet-stream';
// default response status in case of error
const ERR_STAT_DEFAULT = 500;
// system errors & response status association
const errStat = {
	ENOENT: 404
};
// error messages for different response statuses
const errMess = {
	404: (rPath)=>`File ${rPath} not found`,
	500: ()=>'Server error'
};
// file extensions & content type association
const mime = {
	txt: 'text/plain',
	html: 'text/html',
	css: 'text/stylesheet',
	js: 'text/javascript',
	pdf: 'application/pdf',
	json: 'application/json'
};

const server = http.createServer((rq, rs)=> {
	/*
	 * Request handler
	 */


	// request path
	const rPath = url.parse(rq.url).pathname;
	// file path
	const fPath = `${__dirname}/static${rPath}`;
	// response content-type
	let rMime;

	Promise.resolve(fPath)
	// check requested file
		.then(p=> {
			return new Promise((rs, rj)=> {
				fs.stat(p, (e, s)=> {
					if (!!e) {
						rj(e);
					}
					// get requested file's content type based on the file extension
					rMime = mime[path.parse(p).ext.replace(/^\./, '')] || MIME_DEFAULT;
					rs(s);
				})
			});
		})
		// serve the file
		.then(s=> {
			rs.setHeader('Content-Type', rMime);
			rs.setHeader('Content-Length', s.size);
			rs.statusCode = 200;
			fs.createReadStream(fPath).pipe(rs);
		})
		// handle the error
		.catch(e=> {
			const stat = errStat[e.code] || ERR_STAT_DEFAULT;
			rs.writeHead(stat, {'Content-Type': 'text/plain'});
			rs.end(errMess[stat](rPath))
		});
});

// start server
server.listen(PORT, ()=> {
	console.log(`Listening on ${PORT}`);
});