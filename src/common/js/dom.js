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
