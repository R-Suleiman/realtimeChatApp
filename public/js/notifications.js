const btn = document.getElementById('allowNotf')
const publicVapidKey =
  'BHVG0q1uUA_uE4BJDlqaWGGtYpE4sv04uB8j9sWEKXcfHvz8NcEL1wnm7IocC1CITxzaEDcmWTfPG6WzLsB-yH0'
let sw

// Check if the user is subscribed on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Register service worker
      sw = await navigator.serviceWorker.register('worker.js', {
        scope: '/',
      })
    }
  } catch (error) {
    console.log('service worker registration failed')
  }

  const isSubscribed = await checkSubscription()
  updateButtonState(isSubscribed)
})

// Event listener when the button is pressed
btn.addEventListener('click', async () => {
  btn.disabled = true
  const isSubscribed = await checkSubscription()

  if (isSubscribed) {
    // User is already subscribed, so unsubscribe
    await unsubscribeUser()
  } else {
    // User is not subscribed, so subscribe
    await subscribeUser()
  }
})

// Function to check if the user is subscribed
const checkSubscription = async () => {
  // Check if service worker is supported
  if ('serviceWorker' in navigator) {
    // Get push subscription
    const subscription = await sw.pushManager.getSubscription()
    return !!subscription // Return true if user is subscribed, false otherwise
  }
  return false // Service worker is not supported
}

// Function to subscribe the user
const subscribeUser = async () => {
  // Subscribe the user
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBased64ToUint8Array(publicVapidKey),
  })

  // Send push subscription to the server
  const token = localStorage.getItem('token')
  const response = await axios.post(
    '/api/v1/notifications/subscription',
    { subscription },
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (response) {
    btn.disabled = false
    // Update button state
    updateButtonState(true)
  }
}

// Function to unsubscribe the user
const unsubscribeUser = async () => {
  // Get push subscription
  const subscription = await sw.pushManager.getSubscription()

  if (subscription) {
    // Unsubscribe the user
    await subscription.unsubscribe()

    // Remove push subscription from the server
    const token = localStorage.getItem('token')
    const response = await axios.delete('/api/v1/notifications/subscription', {
      headers: { Authorization: `Bearer ${token}` },
      data: { subscription },
    })

    if (response) {
      btn.disabled = false
      // Update button state
      updateButtonState(false)
    }
  }
}

// Function to update the button state based on subscription status
const updateButtonState = (isSubscribed) => {
  btn.textContent = isSubscribed ? 'Block' : 'Allow'
}

// Utility function to convert URL-based base64 to Uint8Array
function urlBased64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  let outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
