const net = require('net');

//data structures for a single chatroom hosted by the ADMIN/server
let presentUsers = [];
let namesInUse = ['ADMIN'];

const server = net.createServer((request) => {
	//handles data received

	//holds all users on server
	presentUsers.push(request);

	request.userName;
	//will kick user if writesInSecond is > 3
	let writesInSecond = 0;

	//creates property 'chatroom' on each request with value-chatname
	//sets current chatroom to main
	request.chatroom = 'main';

	request.on('data', (data) => {
		writesInSecond++;
		const userInput = data.toString().substring(0,data.length-1);

		if (request.userName !== undefined) {
			//splits userInput into an array
			const userInputArr = userInput.split(' ');
			if(userInputArr[0] === '/switch') {
				//switch the user's chatroom to the string following \chat command
				request.chatroom = userInputArr.slice(1,userInputArr.length).join(' ');
			//user should already have joined a chatroom at this point and be typing messages to entire chatroom
			} else {
				sendMessage(userInput,request);
			}
		//client must set their username
		} else {
			let isNew = namesInUse.every(name => {
				return userInput !== name;
			});
			if (isNew){
				request.userName = userInput;
				namesInUse.push(request.userName);
			} else {
				request.write(`username is already taken. please choose another`);
			}
		}

		//kicks user if they surpass the writes per second limit
		if (writesInSecond > 3) {
			request.write(`you typed too fast and surpassed the 3 writes per second limit`);
			request.end();
		}

		function sendMessage(message, sender) {
			presentUsers.forEach(user => {
				if (user.chatroom === sender.chatroom && user !== sender) {
					user.write(`${sender.userName}: ${message}`);
				}
			});
			console.log(`*${sender.chatroom}* ${sender.userName}: ${message}`);
		}


	})

	//reset the writesInSecond to 0 after 1 second
	setInterval(()=> {
		writesInSecond = 0;
	},1000);


	request.write('Type your user name');



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
		console.log(`${request.userName} has left chats`);

		presentUsers.splice(presentUsers.indexOf(request),1);
		presentUsers.forEach(user => {
			if (user.chatroom === request.chatroom) {
				user.write(`${request.userName} has left the chatroom`);
			}
		})
		namesInUse.splice(namesInUse.indexOf(request.userName),1);


		// let index = presentUsers.indexOf(request);
		// presentUsers.splice(index,1);
		// presentUsers.forEach(user => {
		// 	user.write(`${namesInUse[index+1]} has left the chatroom`);

		// })
		// console.log(`${namesInUse[index+1]} has left the chatroom`);
		// namesInUse.splice(index+1,1);
		// userName = undefined;
	})

	


})

//listen for requests on port 8080
server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened server on ${address.port}`);
})

