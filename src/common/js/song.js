import { getLyric, getSongsUrl } from 'api/song'
import { ERR_OK } from 'api/config'
import { Base64 } from 'js-base64'

export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.filename = `C400${this.mid}.m4a`
    this.url = url
  }
  getLyric () {
    // 如果已经获取到了歌词就不用再次请求了
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

// 抽象出一个工厂方法来创建 song 实例可以节省代码
export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: getAllSingers(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url
  })
}

// 抽象出一个方法来拼接歌手,这样就可以直接用了,而不用再处理歌手名字
function getAllSingers (singers) {
  let ret = []
  if (!singers) {
    return ''
  }
  singers.forEach((singer) => {
    ret.push(singer.name)
  })
  return ret.join('/')
}
// 筛选出不用付费的歌曲
export function isValidMusic (musicData) {
  return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

export function processSongsUrl (songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then((purlMap) => {
    // 有的没有 http 前面url部分的需要加上
    songs = songs.filter((song) => {
      // 刚好根据对应的 songmid 匹配对应的 url
      const purl = purlMap[song.mid]
      // 二次筛选,歌曲有对应的 purl 地址的返回,没有的话去除
      if (purl) {
        song.url = purl.indexOf('http') === -1 ? `http://dl.stream.qqmusic.qq.com/${purl}` : purl
        return true
      }
      return false
    })
    // 最后返回不需要付费,又有播放地址的歌曲,真的是一路坎坷,艰难啊!
    return songs
  })
}
