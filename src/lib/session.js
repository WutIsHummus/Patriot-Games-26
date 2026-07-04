// Thin localStorage session helpers shared across pages.

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem('user')
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('quizProfile'))
  } catch {
    return null
  }
}

export function saveProfile(profile) {
  localStorage.setItem('quizProfile', JSON.stringify(profile))
}

export function getLocation() {
  try {
    return JSON.parse(localStorage.getItem('voterLocation'))
  } catch {
    return null
  }
}

export function saveLocation(location) {
  localStorage.setItem('voterLocation', JSON.stringify(location))
}
