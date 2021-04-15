import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/api'

export function getToken() {
  return window.localStorage.getItem(ACCESS_TOKEN)
}

export function setToken(token) {
  return window.localStorage.setItem(ACCESS_TOKEN, token)
}

export function removeToken() {
  return window.localStorage.removeItem(ACCESS_TOKEN)
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN)
}

export function setRefreshToken(token) {
  return window.localStorage.setItem(REFRESH_TOKEN, token)
}

export function removeRefreshToken() {
  return window.localStorage.removeItem(REFRESH_TOKEN)
}
