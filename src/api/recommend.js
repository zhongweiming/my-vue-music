import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

export function getDiscList () {
  // 本地服务器调试,如果是服务器上,则后面要改成对应的请求路径,这样才能转发到服务器!!!
  // const url = debug ? '/api/getDiscList' : 'http://localhost:8080/music/api/getDiscList'
  // 线上服务器使用
  const url = debug ? '/api/getDiscList' : 'http://39.105.0.154/music/api/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq.json',
    hostUin: 0,
    sin: 0,
    ein: 19,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSongList (disstid) {
  // const url = debug ? '/api/getCdInfo' : 'http://localhost:8080/music/api/getCdInfo'
  // 线上服务器使用
  const url = debug ? '/api/getCdInfo' : 'http://39.105.0.154/music/api/getCdInfo'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlySong: 0,
    hostUin: 0,
    platform: 'yqq.json',
    format: 'json',
    needNewCode: 0,
    g_tk: 223141860
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
