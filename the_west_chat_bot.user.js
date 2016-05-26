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
    this.isActive = true;
}

Raffle.prototype.reset = function() {
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
            this.doAdminCommand(message, room);
        }
        this.doCommand(message, room);
    }
}

Bot.prototype.doAdminCommand = function(message, room) {
    switch (message) {
        case "!startraffle":
            if (!this.raffle.isActive) {
                this.sendMessage("do !raffle for keks", room);
                this.raffle.start();
            }
            break;
        case "!getwinner":
            if (this.raffle.isActive)
                this.sendMessage(this.raffle.getRandomPlayer().pname, room);
            break;
    }
}

Bot.prototype.doCommand = function(message, room) {
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
    for(var i = 0; i < this.bot.history.length; i++)
        this.appendPlayerToTable(windowTable, this.bot.history[i]);
    windowContent.appendContent(windowTable.mainDiv);
    windowContent.appendContent("LOL");
    wman.open('twbot', 'twbot', 'noreload').setTitle('twbot').appendToContentPane(windowTable.divMain).setMiniTitle('twbot').setSize('500', '420');

}

var kevin = new Bot(new Raffle());
kevin.init();
var botWindow = new BotWindow(kevin);

var oldFunc = Chat.Formatter.formatResponse;
Chat.Formatter.formatResponse = function(room, from, message, time) {
    kevin.handleMesage(message, room, from, time);
    return oldFunc(room, from, message, time);
};