let room

self.addEventListener('push', async (e) => {
  try {
    const data = e.data.json()
    room = data.room

    // check the visibility state of the page before showing notification
    const isVisible = await isPageVisible()

    if (!isVisible) {
      self.registration.showNotification(data.title, {
        body: `${data.user}: ${data.message}`,
        icon: 'img/user.png',
        badge: 'img/favicon.png',
        tag: data.room,
        vibrate: [200, 100, 200],
      })
    }
  } catch (error) {
    console.error('Error parsing push event data:', error)
  }
})

const isPageVisible = async () => {
  const clients = await self.clients.matchAll({ type: 'window' })

  // specific url to check
  for (const client of clients) {
    if (client.visibilityState === 'visible') {
      const clientUrl = new URL(client.url)
      const clientRoom = clientUrl.searchParams.get('room')

      if (clientRoom === room) {
        return true
      }
    }
  }
  return false
}

// listen for a click event in the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close() // Close the notification

  // Open chat.html when the notification is clicked
  const urlToOpen = `/chat.html?room=${room}`

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      console.log(clientList)
      for (const client of clientList) {
        // Check if the URL starts with the expected pattern
        if (client.url.endsWith(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }

      // If no matching client found, open a new window with the specified URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
