var token = process.env.token;
var bot = require('express')();
var bodyParser = require('body-parser');
var request = require('request');

var url = `https://api.telegram.org/bot${token}/`;

request({
	url: url + 'setWebhook',
	method: 'POST',
	json: true,
	body: {
		url: process.env.url + token
	}
}, function (error, response, body) {
	console.log(body.description);
});

function sendMessage (chat_id, text) {
	request({
		url: url + 'sendMessage',
		method: 'POST',
		json: true,
		body: {
			chat_id: chat_id,
			text: text
		}
	});
}

bot.use(bodyParser.json());

var lastUpdate_id, isNoting;

bot.post('/' + token, function (req, res) {
	if (lastUpdate_id != req.body.update_id) {
		lastUpdate_id = req.body.update_id;
		if (req.body.message) {
			var message = req.body.message;
			if (/rachel/ig.test(message.text)) sendMessage(message.chat.id, `I've been with Rachel for ${Math.floor((new Date() - new Date('2016-05-19 EDT')) / (1000 * 60 * 60 * 24))} days.`);
			else if (message.from.username === 'neolwc') {
				if (isNoting) {
					isNoting = false;
					request({
						url: process.env.noteAPI,
						method: 'POST',
						json: true,
						body: {
							title: message.text,
							content: ''
						}
					}, function (error, response, body) {
						sendMessage(message.chat.id, body.message);
					});
				}
				else if (message.entities) {
					if (message.text.indexOf('/note') >= 0) {
						isNoting = true;
						sendMessage(message.chat.id, 'Please reply with you note.');
					}
				}
				else sendMessage(message.chat.id, 'Hey beloved ' + message.from.first_name);
			}
			else { // not me
				sendMessage(message.chat.id, 'Hey ' + message.from.first_name);
			}
		}
	}
	res.send();
});

bot.listen(process.env.PORT || process.env.VCAP_APP_PORT || 443);
