let room

self.addEventListener('push', (e) => {
  try {
    const data = e.data.json()
    room = data.room
    self.registration.showNotification(data.title, {
      body: `${data.user}: ${data.message}`,
      icon: '../img/ICT-Club-logo.jpg',
      badge: '../img/ICT-Club-logo.jpg',
      vibrate: [200, 100, 200],
    })
  } catch (error) {
    console.error('Error parsing push event data:', error)
  }
})

// listen for a click event in the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close() // Close the notification

  // Open a specific page or URL when the notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === `/chat.html?room=${room}` && 'focus' in client) {
          return client.focus()
        }
      }

      // If no matching client found, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
