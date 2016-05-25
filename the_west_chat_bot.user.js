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
        switch (message) {
            case "!kek":
                this.sendMessage("kek.", room);
                break;
            case "!raffle" :
                if (this.raffle.isActive) {
                    this.raffle.addPlayer(player);
                    this.sendMessage(player.pname + " added to raffle.", room);
                }
                break;
        }
    }
}

Bot.prototype.init = function() {
    var initDate = new Date();
    var initMessage = "[" + initDate.getHours() + ":" + initDate.getMinutes() + "] xBot: Initialised!";
    this.history.push(initMessage);
    return "Bot activated.";
}

var Tamboola = new Raffle();
var Kevin = new Bot(Tamboola);
Kevin.init();

var oldFunc = Chat.Formatter.formatResponse;
Chat.Formatter.formatResponse = function(room, from, message, time) {
    Kevin.handleMesage(message, room, from, time);
    return oldFunc(room, from, message, time);
};