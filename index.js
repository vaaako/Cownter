// Keep alive //
const express = require('express');
const app = express();
app.get("/", (request, response) => {
	const ping = new Date();
	ping.setHours(ping.getHours() - 3);
	console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
	response.sendStatus(200);
});
app.listen(process.env.PORT); // Keeps bot online


// Actual code //
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const FILE_PATH = 'counters.json';
const PREFIX = '>';


const client = new Client({
	partials: ["CHANNEL"],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});

const fs = require("fs");
client.on('ready', async () => {
	console.log("Cowntando \n*happy cow noises*!")
});

client.on('messageCreate', async (message) => {
	let msg = message.content;
	let channel = message.channel;

	if(message.author.bot) return;

	if(msg.startsWith(PREFIX)) {
		// Command args
		let command = msg.split(PREFIX)[1].split(' ');
		let cmd = command[0].toLowerCase();
		let args = command.slice(1);

		// Init "database"
		let data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'))

		// Init embed
		let embed = new EmbedBuilder();
		embed.setColor(0xca1773);

		// Check if have counters avaiable
		if(cmd!="make") {
			if(!data.length) {
				embed.setDescription("Nenhum contador disponível! \nCrie um com o comando `>make [nome do contador]`");
				return channel.send({ embeds: [embed] });
			}
		}
		
		// "Handler"
		switch(cmd) {
			case 'counters':
				let desc = "";
				for(let i=0; i<data.length; i++) {
					desc += `**${i+1}.** ${data[i]['name']} ― **${data[i]['counting']}**\n`;
				}
				embed.setDescription(desc);
				break;

	
		  case 'make':
				let title = args.join(' ');
				if(!title) {
					embed.setDescription("Você esqueceu de digitar o título do contador!");
					break;
				}

				let entryExists = data.some(obj => obj.name.toLowerCase() === title.toLowerCase());
				if(entryExists) {
					embed.setDescription("Esse contador já existe!");
					break;
				}

				data.push({
					name: title,
					counting: 0
				})
				// fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2));
				fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

				embed.setDescription(`Contador **${title}** criado!`);
		    break;

		  case 'delete':
				if(!args || isNaN(args[0]) || args[0] > data.length) {
					embed.setDescription("Não é assim que se usa esse comando! \nEx.: `>delete 1` *(deletar contador **1**)*");
					break;
				}

				let index = args[0]-1;
				embed.setDescription(`Contador **${data[index]['name']}** foi deletado!`);

				data.splice(index, 1);
				fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
				break;
				
		  case 'count': // >count 2 1
				if(!args || isNaN(args[0]) || ( args[1] && isNaN(args[1]) )) {
					embed.setDescription("Esse não é o jeito certo de usar esse comando! \n**Ex.:** `>count 2 -1` *(diminuir **-1** no contador **2**)* \n**Obs.:** O valor padrão é **+1**, então se quiser **aumentar** em **1**, não precisa digitar nada");
					break;
				}

				let indexd = args[0]-1;
				let counter = parseInt(args[1]) || 1;

				if(!data[indexd]) {
					embed.setDescription(`Essa nota não existe! \nAs notas atuais vão de **1** - **${data.length}**`);
					break;
				}

				data[indexd]['counting'] += counter;
				fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));


				let def = counter;
				if(counter > 0)
					def = '+' + counter; // Add or not aaaah you get the idea

				embed.setDescription(`${data[indexd]['name']} **${def}**!`);	
				break;


				
		  default:
		    embed.setDescription('Uuhhh o que você quis dizer?');
		}

		// Just send whatever became the title
		return channel.send({ embeds: [embed] });

	}
});


// let data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'))

// 	let obj = [
// 		{
// 			name: "john",
// 			counting: 3
// 		}
// 	]
// 	fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2));
// 	const entryExists = jsonData.some(obj => obj.name === newName);




// Login into the bot
client.login(process.env['TOKEN'])
