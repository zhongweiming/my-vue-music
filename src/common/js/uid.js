let _uid = ''

export function getUid () {
  if (_uid) {
    return _uid
  }
  // 模仿 qq 音乐计算 uid 的算法
  if (!_uid) {
    const t = (new Date()).getUTCMilliseconds()
    _uid = '' + Math.round(2147483647 * Math.random()) * t % 1e10
  }
  return _uid
}
