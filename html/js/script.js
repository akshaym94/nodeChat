$(document).ready(function(){
	var name = $('.sender-name'),
		message = $('.message'),
		chatWindow = $('.chat-window'),
		socket;

	var escape = function(html){
		var escapedHtml = html.replace(/&/g, '&amp;')
	                  .replace(/>/g, '&gt;')
	                  .replace(/</g, '&lt;')
	                  .replace(/"/g, '&quot;')
	                  .replace(/'/g, '&apos;');
	    return escapedHtml;              
	};

	try{
		socket = io.connect('http://nodechatty.herokuapp.com');
	}catch(Error){
		console.log('Error connecting to server!');
	}

	socket.on('output', function(res){
		for(var i=0; i<res.length; i++){
			chatWindow.prepend("<p>" + escape(decodeURI(res[i].name)) + "<span>" +  new Date(res[i].date).toLocaleString('en-us') + "</span><br>" + escape(decodeURI(res[i].message)) + "</p><hr>");
				message.val("");
		}
	});

	message.keydown(function(e){
		if(e.which === 13 && e.shiftKey === false){
			if(name.val() && message.val()){
				/**/
				socket.emit('input', {
					name: escape(name.val()),
					message: escape(message.val().replace(/\n/g, '<br>')),
					date: new Date().getTime()
				});
				message.val('');
			}
			e.preventDefault();
		}
	});
})