const net = require('net');

let presentUsers = [];
let namesInUse = ['ADMIN'];

const server = net.createServer((request) => {
	//handles data received

	let userName;
	//will kick user if writesInSecond is > 3
	let writesInSecond = 0;

	request.on('data', (data) => {
		writesInSecond++;
		const userInput = data.toString().substring(0,data.length-1);
		//client has succesfully selected a username and has typed a command or message
		if (userName !== undefined) {
			//private message a user if /pm precedes their message
			if(userInput.substring(0,3) === '/pm') {
				let userInputArr = userInput.split(' ');
				let intendedViewer = userInputArr[1];
				let privateMessage = userInputArr.slice(2,userInputArr.length).join(' ');

				if (namesInUse.indexOf(intendedViewer) > -1) {
					let index = namesInUse.indexOf(intendedViewer);
					presentUsers[index-1].write(`${userName} has sent you a private message \n* ${privateMessage} *`);
				} else {
					request.write(`${intendedViewer} is not in the chatroom`);
				}
			} else {
				//send message to all users in chatroom
				presentUsers.forEach(user => {
					if (request !== user) {
						user.write(`${userName}: ${userInput}`);
					}
				})
				console.log(`${userName}: ${userInput}`);
			}

		//client must set their username
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

		//kicks user if they surpass the writes per second limit
		if (writesInSecond > 3) {
			request.write(`you typed too fast and surpassed the 3 writes per second limit`);
			request.end();
		}


	})

	//reset the writesInSecond to 0 after 1 second
	setInterval(()=> {
		writesInSecond = 0;
	},1000);


	request.write('Type your user name'); //preparing the envelope
	// request.end(); //send the envelope



	//admin write to all users in chat
	process.stdin.on('readable', () => {
	  var chunk = process.stdin.read();
	  if (chunk !== null) {
	  	if (chunk.toString().substring(0,5) ==='/kick') {
	  		//kick out user
	  		let index = namesInUse.indexOf(chunk.toString().substring(6,chunk.length-1));
	  		if (index > -1) {
	  			presentUsers[index-1].write('you have been kicked by the ADMIN');
	  			presentUsers[index-1].end();
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
			user.write(`${namesInUse[index+1]} has left the chatroom`);

		})
		console.log(`${namesInUse[index+1]} has left the chatroom`);
		namesInUse.splice(index+1,1);
		userName = undefined;
	})

	


})

//listen for requests on port 8080
server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened server on ${address.port}`);
})

