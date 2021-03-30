import { Notification, Message } from 'element-ui'

export const notify = (type, title, message, showClose) => Notification({
  title: title,
  message: message,
  type: type,
  showClose: showClose
})

export const tip = (type, message) => Message({
  type: type,
  message: message
})
