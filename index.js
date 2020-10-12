const { Client, Collection } = require('discord.js');
const client = new Discord.Client({disableEveryone: true, autoReconnect: true});
client.config = require('./config.json');
client.startTime = Date.now();

const commands = {
    ping: {
        run: async function(message, args) { 
                const msg = await message.channel.send(":question:  **Ping?**");
                return msg.edit(`:ping_pong:  **Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.**`);
        },
        help: {
            name: 'Ping',
            description: "Sends ping of API and client.",
            usage: 'ping'
        },
        options: {
            owner_Command: false,
            admin_Command: false,
            runDM: false
        }
    },
    help: {
        run: function(message,args) {
            if(!args[0]) {
                const commandArray = Object.keys(commands);
                let output = "";
                let commandHelp = {};
                for(let i = 0;i < commandArray.length; i++) {
                    commandHelp = commands[commandArray[i]].help;
                    output = output + `${commandHelp.name}: ${commandHelp.description}${commandArray[i+1]?'\n':''}`;
                }
                message.channel.send(output+"\n**Use >help [Command] to learn more**");
            } else {
                const command = args[0].toLowerCase();
                if(commands.hasOwnProperty(command)) {
                    const commandHelp = commands[command].help;
                    message.channel.send(`${commandHelp.name}: ${commandHelp.description}\nUsage: ${client.config.prefix+commandHelp.usage}`);
                } else {
                    message.channel.send(`:x:  **Command '${command}' doesn't exist**`);
                }
            }
        },
        help: {
            name: 'Help',
            description: "Sends the commands and their descriptions.",
            usage: 'help'
        },
        options: {
            owner_Command: false,
            admin_Command: false,
            runDM: false
        }
    }
}

const runCommand = (command, message, arguments) => {
    try {
        if(commands.hasOwnProperty(command)) {
            command = commands[command];

            if(command.options.admin_Command && !message.member.hasPermission(['ADMINISTRATOR']) || command.settings.owner_Command && message.author.id != client.config.ownerID) {
                message.channel.send(":x:  **Sorry, but you cannot use that command.**");
                return console.log(`[${message.guild.name}] - '${message.author.username}' tried to run the command '${command.help.name}' with args '${arguments}', but was blocked`)
            }
            if(!command.options.runDM && message.channel.type == 'dm')
                return message.channel.send(":x:  **This command is server only**");  

            console.log(`[${message.guild.name}] - '${message.author.username}' ran the command '${command.help.name}' with args '${arguments}'`);

            try {
                return command.run(message, arguments);
            } catch(err) {
                return console.error(`${command.info.name}_Error: ${err}`)
            }
        }
    } catch(e) {return console.error("command_Error: " + e);}
};

client.on('ready',async()=>{
    client.user.setActivity(`Serving ${client.guilds.size} servers. | ${client.config.prefix}help | Made by L33`);
    console.log(`[INVITE] - https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
    const servers = client.guilds.map(guild => `\n\t> '${guild.name}' with Owner '${guild.owner.user.tag}' with ${guild.memberCount}`);
    console.log(`[INFO] - ${client.user.username} is online in ${client.guilds.size} servers: ${servers}.`);
    console.log(`[CREATION] - ${client.user.username} was made on '${client.user.createdAt}'`);
    console.log(`[STATUS] - ${client.user.username} loaded in ${Date.now() - client.startTime}ms`);
});

client.on('message', async(message) => { 
    if (!message.content.startsWith(client.config.prefix) || message.author.bot) {return;}
    const args = message.content.substring(client.config.prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    runCommand(command, message, args);
});

client.login(client.config.token);