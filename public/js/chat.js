const socket = io()

// Elements
const $messageForm = document.querySelector("#sendMessage")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#sendLocation")
const $messages = document.querySelector("#messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options

const {username, room} =  Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New Message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessagesMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessagesMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far i have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (obj) => {

    const anchor = Mustache.render(locationMessageTemplate, {
        username: obj.username,
        url: obj.text,
        createdAt: moment(obj.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', anchor)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    
    document.querySelector("#sidebar").innerHTML = html
})


$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Disable Button to send message
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (error) => {

        // Enable Button to send message
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }

        console.log("Message delivered successfully")
    })

})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})