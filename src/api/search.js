import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

export function search (keyword, page, zhida, perpage) { // page 为搜索结果页
  // const url = debug ? '/api/search' : 'http://localhost:8080/music/api/search'
  // 线上服务器使用
  const url = debug ? '/api/search' : 'http://39.105.0.154/music/api/search'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1,
    w: keyword,
    perpage,
    n: perpage,
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    p: page,
    remoteplace: 'txt.mqq.all'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
