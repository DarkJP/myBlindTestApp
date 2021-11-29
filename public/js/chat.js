const inpt_msg = document.getElementById('inpt_msg');
const btn_send_msg = document.getElementById('btn_send_msg');

/* Chat messages coming from server */
socket.on('message', msg => {
    displayChatMessage(msg);
});

/* Chat messages from user w/ Enter key */
inpt_msg.addEventListener('keydown', function(e) {
    if (e.code == 'Enter' || e.code == 'NumpadEnter') {
        sendMessageToServer(inpt_msg.value);
    }
})

/* Chat messages from user w/ button click */
btn_send_msg.onclick = function btnSendMessageClick() {
    sendMessageToServer(inpt_msg.value);
}

function sendMessageToServer(message) {
    if (inpt_msg.value != '') {
        socket.emit('chatMessage', message);
        inpt_msg.value = '';
    }
}

function displayChatMessage(message) {
    let p = document.createElement('p');
    p.innerHTML = `<b>${message.username} :</b> ${message.msg}`
    div_messages.append(p);
    div_messages.scrollTop = div_messages.scrollHeight;
}