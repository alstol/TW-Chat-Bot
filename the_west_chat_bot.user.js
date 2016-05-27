// ==UserScript==
// @name         The West Chat Bot
// @version      2.0
// @description  Description goes here
// @author       Allen "xShteff" McPotter
// @website      http://beta.the-west.net
// @include      *.the-west.*/game.php*
// @downloadURL  http://allenmcpotter.me/userscript/user.js
// @updateURL    http://allenmcpotter.me/userscript/user.js
// ==/UserScript==
/*
    COPYRIGHT
    End users are licensed the right to download the code into their web browser(s) for standard and reasonable usage only.
    If you want the script translated, you shall contact the script owner for this.
*/
var kek = {};
var PollOption = function(option) {
    kek[option] = 0;
}
var Raffle = function() {
    this.isActive = false;
    this.prize;
    this.players = [];
}

Raffle.prototype.checkIfRegistered = function(player) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].pname == player.pname)
            return true;
    }
    return false;
}

Raffle.prototype.addPlayer = function(player) {
    if (!(this.checkIfRegistered(player)))
        this.players.push(player);
}

Raffle.prototype.getRandomPlayer = function() {
    return this.players[Math.floor(Math.random() * this.players.length)];
}

Raffle.prototype.stop = function() {
    this.isActive = false;
}

Raffle.prototype.start = function() {
    this.resetPlayers();
    this.isActive = true;
}

Raffle.prototype.resetPlayers = function() {
    this.players = [];
}

var Bot = function(raffle) {
    this.raffle = raffle;
    this.owner = Character.name;
    this.colorCode = 990;
    this.history = [];
    this.latestData = {
        command: null,
        room: null,
        player: null,
        time: new Date()
    };
}

Bot.prototype.updateData = function(cmd, room, player, time) {
    this.latestData["command"] = cmd;
    this.latestData["room"] = room;
    this.latestData["player"] = player;
    this.latestData["time"] = new Date(time);
}

Bot.prototype.addHistory = function(time, player, message) {
    var date = new Date(time);
    var message = "[" + date.getHours() + ":" + date.getMinutes() + "] " + player.pname + ": " + message;
    this.history.push(message);
}

Bot.prototype.sendMessage = function(message, room) {
    Chat.Request.Send("/" + this.colorCode + message, room);
}

Bot.prototype.checkIfCommand = function(message) {
    return message.charAt(0) == "!";
}

Bot.prototype.canExecute = function(time) {
    return this.latestData["time"] < new Date(time - 2000);
}

Bot.prototype.handleMesage = function(message, room, player, time) {
    if (this.canExecute(time) && this.checkIfCommand(message)) {
        this.updateData(message, room, player, time);
        this.addHistory(time, player, message);
        if (player.pname == this.owner) {
            this.doAdminCommand(message, room, player, time);
        }
        this.doCommand(message, room, player, time);
    }
}

Bot.prototype.doAdminCommand = function(message, room, player, time) {
    switch (message) {
        case "!initraffle":
            if (!this.raffle.isActive) {
                this.sendMessage("do !raffle for keks", room);
                this.raffle.start();
            }
            break;
        case "!getwinner":
            if (this.raffle.isActive)
                this.sendMessage(this.raffle.getRandomPlayer().pname, room);
            break;
        case "!rafflereset":
            this.raffle.resetPlayers();
            this.sendMessage("Raffle reset.", room);
            break;
    }
}

Bot.prototype.doCommand = function(message, room, player, time) {
    switch (message) {
        case "!kek":
            this.sendMessage("kek.", room);
            break;
        case "!raffle":
            if (this.raffle.isActive) {
                this.raffle.addPlayer(player);
                this.sendMessage(player.pname + " added to raffle.", room);
            }
            break;
    }
}

Bot.prototype.init = function() {
    var initDate = new Date();
    var initMessage = "[" + initDate.getHours() + ":" + initDate.getMinutes() + "] xBot: Initialised!";
    this.history.push(initMessage);
    return "Bot activated.";
}

var BotWindow = function(bot) {
    this.bot = bot;
}

BotWindow.prototype.appendPlayerToTable = function(table, data) {
    table.appendRow().appendToCell(-1, 'log', data);
}

BotWindow.prototype.open = function() {
    var windowContent = new west.gui.Scrollpane();
    var windowTable = new west.gui.Table();
    windowTable.addColumn('log').appendToCell('head', 'log', 'Command Log');
    for (var i = 0; i < this.bot.history.length; i++)
        this.appendPlayerToTable(windowTable, this.bot.history[i]);
    windowContent.appendContent(windowTable.divMain);
    windowContent.appendContent("LOL");
    wman.open('twbot', 'twbot', 'noreload').setTitle('twbot').appendToContentPane(windowContent.divMain).setMiniTitle('twbot').setSize('500', '420');

}

var styling = "<style>#raffle_table{width:50%; float: left; } .player_name{width:75%;} .player_level{width:25%;} </style>";
$('head').append(styling);

var RaffleWindow = function(bot) {
    this.bot = bot;
}

RaffleWindow.prototype.appendPlayerToTable = function(table, player) {
    table.appendRow().appendToCell(-1, 'player_level', player.level);
    table.appendToCell(-1, 'player_name', player.pname);
}

RaffleWindow.prototype.open = function() {
    var windowContent = new west.gui.Scrollpane();
    var windowTable = new west.gui.Table();
    windowTable.setId('raffle_table');
    windowTable.addColumn('player_level').appendToCell('head', 'player_level', 'Level');
    windowTable.addColumn('player_name').appendToCell('head', 'player_name', 'Name');
    for (var i = 0; i < this.bot.raffle.players.length; i++)
        this.appendPlayerToTable(windowTable, this.bot.raffle.players[i]);
    windowContent.appendContent(windowTable.divMain);
    var testButton = new west.gui.Button("Kek", function() {
        alert('yay');
    })
    var testButton2 = new west.gui.Button("Kek2", function() {
        alert('yay2');
    })
    windowContent.appendContent(testButton.divMain);
    windowContent.appendContent(testButton2.divMain);

    wman.open('Raffle', 'Raffle', 'noreload').setTitle('Raffle').appendToContentPane(windowContent.divMain).setMiniTitle('Raffle').setSize('500', '420');
}

var kevin = new Bot(new Raffle());
kevin.init();
var botWindow = new BotWindow(kevin);
var raffleWindow = new RaffleWindow(kevin);

var iconLogs = $('<div></div>').attr({
    'title': 'TW Bot Command Log',
    'class': 'menulink'
}).css({
    'background': 'url(https://puu.sh/nS9e8/51058dca5d.png)',
    'background-position': '0px 0px'
}).mouseleave(function() {
    $(this).css("background-position", "0px 0px");
}).mouseenter(function(e) {
    $(this).css("background-position", "25px 0px");
}).click(function() {
    botWindow.open();
});
var fix = $('<div></div>').attr({
    'class': 'menucontainer_bottom'
});

var raffleMenu = $('<div></div>').attr({
    'title': 'TW Bot Raffle',
    'class': 'menulink'
}).css({
    'background': 'url(https://puu.sh/nS9e8/51058dca5d.png)',
    'background-position': '0px 0px'
}).mouseleave(function() {
    $(this).css("background-position", "0px 0px");
}).mouseenter(function(e) {
    $(this).css("background-position", "25px 0px");
}).click(function() {
    raffleWindow.open();
});
var fix = $('<div></div>').attr({
    'class': 'menucontainer_bottom'
});
$("#ui_menubar .ui_menucontainer :last").after($('<div></div>').attr({
    'class': 'ui_menucontainer',
    'id': 'bot_logs'
}).append(iconLogs).append(raffleMenu).append(fix));

var oldFunc = Chat.Formatter.formatResponse;
Chat.Formatter.formatResponse = function(room, from, message, time) {
    kevin.handleMesage(message, room, from, time);
    return oldFunc(room, from, message, time);
};