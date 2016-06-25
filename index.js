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

var lastUpdate_id;

bot.post('/' + token, function (req, res) {
	if (lastUpdate_id != req.body.update_id) {
		lastUpdate_id = req.body.update_id;
		if (req.body.message) {
			var message = req.body.message;
			sendMessage(message.chat.id, 'Hey ' + message.from.first_name);
		}
	}
	res.send();
});

bot.listen(process.env.PORT || process.env.VCAP_APP_PORT || 443);