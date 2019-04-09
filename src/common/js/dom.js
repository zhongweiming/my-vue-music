export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  el.className += ' ' + className
}

export function hasClass (el, className) {
  if (el.className.indexOf(className) < 0) {
    return false
  } else {
    return true
  }
}

export function setDate (el, name, val) {
  el.setAttribute('data-' + name, val)
}

export function getDate (el, name) {
  return el.getAttribute('data-' + name)
}
