const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// get room and users
socket.on('room-users', ({ room, users }) => {
    outputRoomName(room);
    outputRoomUsers(users);
});

// join chatroom
socket.emit('join-room', { username, room })

// listening for server message
socket.on('chat-message', msg => {
    console.log(msg);
    outputMessage(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    // emit a message to the server
    socket.emit('chat-message', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to users
function outputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
  <p class="text">
    ${msg.text}
  </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Output room name
function outputRoomName(room) {
    roomName.innerText = room;
}

function outputRoomUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}` 
}