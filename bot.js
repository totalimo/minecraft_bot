// require the discord.js module
const util = require('minecraft-server-util');
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const shell = require('shelljs')
const status = require('minecraft-server-status')


bot_secret_token = "bot token here"

client.login(bot_secret_token)

client.once('ready', () => {
    console.log('Ready!');
    client.channels.cache.get('channel id here').send('Ready!');

});

const server = {
    ip: "minecraft server here",
    port: 25565
}

const commands = {
    status: {
        command: '/status', //the commands and texts can be edited
        text: {
            error: 'Beim Aufrufen der Informationen ist ein Fehler aufgetreten...', 
            online: '**RG-Gamers** server ist **online**  -  ',
            players: '**{online}** Spieler sind gerade online!', 
            noPlayers: '**Zurzeit ist kein Spieler online.**'
        }
        
    },
    ip: {
        command: '/ip',
        text: {
            main: 'Die IP Adresse ist `{ip}:{port}`, um auf dem Server spielen zu können, musst du auf der Whitelist sein! Kontaktiere dafür <@&583261058634874880>' 
        }
    },
    start: {
        command: '/start',
        text: {
            error: 'Beim Ausführen des Befehls ist ein Fehler aufgetreten...',
            successful: 'Der Server wurde gestartet. Warte bitte einen Moment bis zu connecten kannst.',
            already: 'Der Server ist schon online! Die IP Adresse ist `gamers.ddnss.ch:5022` .',
            wait: 'Es wird versucht den Server zu starten, in 2 Minuten wird automatisch ein Status Command ausgeführt. Bitte warte...'

        }
    }
};

const cacheTime = 30 * 1000; // 30 sec cache time
let data, lastUpdated = 0;

client.on('message', message => { // Listen for messages and trigger commands
    if(message.content.trim() == commands.status.command) {
        statusCommand(message)
    } else if(message.content.trim() == commands.ip.command) {
        ipCommand(message)
    } else if(message.content.trim() == commands.start.command) {
        checkCommand(message)
    } else if(message.content.trim() == commands.info.command) {
        infoCommand(message)
    }
});

function statusCommand(message) { // Handle status command
    if(Date.now() > lastUpdated + cacheTime) { // Cache expired or doesn't exist
        util.status(server.ip, { port: server.port })
        .then(res => {
            data = res;
            lastUpdated = Date.now();
            replyStatus(message)
        })
        .catch(err => {
            console.error(err);
            return message.reply(commands.status.text.error);
        });
    } else { // Use cached data
        replyStatus(message)
    }
}

function replyStatus(message) {
    let { text } = commands.status;
    let status = text.online;
    status += data.onlinePlayers ? text.players : text.noPlayers;
    status = status.replace('{online}', data.onlinePlayers);
    message.reply(status);
}

function ipCommand(message) { // Handle IP command
    message.reply(commands.ip.text.main.replace('{ip}', server.ip).replace('{port}', server.port));
}

function checkCommand(message) {
    status(server.ip, server.port, response => {
        console.log(response)
        if (response.online == true) {
            message.reply(commands.start.text.already);
        }
        else {
            startCommand(message);
        }
    })
}

function startCommand(message) {
    shell.exec('./start.sh');
    message.reply(commands.start.text.wait)
    setTimeout (() => {
        status(server.ip, server.port, response => {
            console.log(response)
            if (response.online == true) {
                message.reply(commands.start.text.successful);
            }
            else {
                message.reply(commands.start.text.error);
            }
        }) 
    }, 120000);
}



