//create socket connection to server in this file

const net = require('net');

const options = {
	'port' : 8080, 
	'host': '127.0.0.1'
}

//creates a socket connection to a server
const client = net.connect(options, () => {

	console.log('connected to server');
});

//handles data received
client.on('data',(data) => {
	console.log(data.toString());
})


//take input from the command line
process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    client.write(chunk);
  }
});
