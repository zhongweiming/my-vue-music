<template>
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
          ref="suggest">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item, index) in result" :key="index" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
<!--      为什么放在这里就能看到，而放在 ul下面就看不到呢-->
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result :title="title"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import {search} from '../../api/search'
import { ERR_OK } from '../../api/config'
import { createSong, isValidMusic, processSongsUrl } from '../../common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from '../../common/js/singer'
import NoResult from 'base/no-result/no-result'
import {mapMutations, mapActions} from 'vuex'
const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  name: 'suggest',
  components: {
    Scroll,
    Loading,
    NoResult
  },
  props: {
    keyword: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      title: '抱歉，暂无搜索结果',
      flag: false, // 用来控制先请求第一页数据，即先执行 search 再执行 searchMore
      beforeScroll: true
    }
  },
  methods: {
    search () {
      this.hasMore = true
      this.page = 1
      // console.log(this.page)
      // 当关键词改变时，重新滚动到顶部，而不是任然停留在中间
      this.$refs.suggest.scrollTo(0, 0)
      // 搜索词为空则不用搜索
      if (!this.keyword) {
        return
      }
      // 一开始的时候下面的 searchMore 也会执行，立马就修改了这个 this.page 为 2了，所以每次都从第二页获取就会有问题
      // 强制一开始搜索的时候从第一页开始
      // 设置了 标志位 flag，这个也就没必要设置了，直接用 this.page 即可，不必担心变为 2 了
      // let page = 1
      search(this.keyword, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this._geneResult(res.data, this.page).then((result) => {
            this.result = result
            this.flag = true
            console.log(this.result)
          })
          this._checkMore(res.data)
        }
      })
    },
    searchMore () {
      // 搜索词为空则不用搜索||没有更多结果了也不用再搜索了||第一页数据没有请求到的时候不必 hasMore
      if (!this.hasMore || !this.keyword || !this.flag) {
        return
      }
      this.page++
      // console.log(this.page)
      search(this.keyword, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          // console.log(this.page)
          this._geneResult(res.data, this.page).then((result) => {
            this.result = this.result.concat(result)
          })
          this._checkMore(res.data)
        }
      })
    },
    getIconCls (item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName (item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    listScroll () {
      this.$emit('listScroll')
    },
    refresh () {
      this.$refs.suggest.refresh()
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ]),
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    _geneResult (data, page) {
      let ret = []
      // 加一个 page 防止第二页的时候还继续获取歌手，没必要
      console.log(page)
      if (data.zhida && data.zhida.singerid && page === 1) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      // 异步获取返回的数据，可以用一个 promise 或者 callback，这里用一下 promise
      if (data.song) {
        // concat 拼接数组，注意不改变原数组，返回拼接后的新数组
        return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
          // 注意 promise 这里是异步操作，所以 return 要放在这里面才不会一直返回空
          // 单纯的这里写一个 return ret 根本是没用的，外层还得 return
          return ret
        })
      }
      return ret
    },
    _checkMore (data) {
      const song = data.song
      if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song) {
        this.hasMore = false
      }
    }
  },
  watch: {
    keyword (newKeyword) {
      // 使得searchMore 不这么快执行
      this.flag = false
      this.search()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
