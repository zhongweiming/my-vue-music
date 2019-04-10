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

// 处理css兼容性,自动加上前缀
let elementStyle = document.createElement('div').style

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

export function prefixStyle (style) {
  if (!vendor) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
