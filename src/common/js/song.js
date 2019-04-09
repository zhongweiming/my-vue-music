export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
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
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
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
