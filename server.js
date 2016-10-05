const net = require('net');

let presentUsers = [];
let namesInUse = ['ADMIN\n'];

const server = net.createServer((request) => {
	//handles data received

	let userName;

	request.on('data', (data) => {
		const userInput = data.toString();
		if (userName !== undefined) {
			//they already registered
			presentUsers.forEach(user => {
				if (request !== user) {
					user.write(`${userName.substring(0,userName.length-1)}: ${userInput.substring(0,userInput.length-1)}`);
				}
			})
			console.log(`${userName.substring(0,userName.length-1)}: ${userInput.substring(0,userInput.length-1)}`);

		} else {
			let isNew = namesInUse.every(name => {
				return userInput !== name;
			});
			if (isNew){
				userName = userInput;
				presentUsers.push(request);
				namesInUse.push(userName);
			} else {
				request.write(`username is already taken. please choose another`);
			}
		}
	})

	request.write('Type your user name'); //preparing the envelope
	// request.end(); //send the envelope



	//admin write to all users in chat
	process.stdin.on('readable', () => {
	  var chunk = process.stdin.read();
	  if (chunk !== null) {
	  	if (chunk.toString().substring(0,5) ==='/kick') {
	  		//kick out user
	  		let index = namesInUse.indexOf(chunk.toString().substring(6));
	  		if (index > -1) {
	  			presentUsers[index-1].write('you have been kicked by the ADMIN');
	  			presentUsers[index-1].end();
	  			// presentUsers.splice(index-1,1);
	  			// namesInUse.splice(index,1);
	  		} else {
	  			console.log('that user does not exist');
	  		}
	  	} else {
		    presentUsers.forEach(user => {
		    	user.write(`ADMIN: ${chunk.toString().substring(0,chunk.length-1)}`);
		    }) 
	  	}
	  }
	});

	//handles request ended
	request.on('end',() => {
		let index = presentUsers.indexOf(request);
		presentUsers.splice(index,1);
		presentUsers.forEach(user => {
			user.write(`${namesInUse[index+1].substring(0,namesInUse[index+1].length-1)} has left the chatroom`);

		})
		console.log(`${namesInUse[index+1].substring(0,namesInUse[index+1].length-1)} has left the chatroom`);
		namesInUse.splice(index+1,1);
		userName = undefined;
	})

	//handles 


})

//listen for requests on port 8080
server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened server on ${address.port}`);
})
