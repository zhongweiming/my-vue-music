<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box @query="handleQuery" ref="searchBox"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!keyword">
      <scroll class="shortcut" :data="shortcut" ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="(item, index) in hotKey" :key="index"
                  @click="clickHot(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="clickSearchHistory" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" ref="searchResult" v-show="keyword">
      <suggest :keyword="keyword" @listScroll="blurInput" @select="saveSearch" ref="suggest"></suggest>
    </div>
    <confirm :text="alertText" confirmText="清空" ref="confirm" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
import {getHotKey} from '../../api/search'
import { ERR_OK } from '../../api/config'
import Suggest from 'components/suggest/suggest'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import {mapActions, mapGetters} from 'vuex'
import Scroll from '../../base/scroll/scroll'
import { playlistMixin } from '../../common/js/mixin'

export default {
  name: 'Search',
  mixins: [playlistMixin],
  components: {
    Scroll,
    SearchBox,
    Suggest,
    SearchList,
    Confirm
  },
  created () {
    this._getHotKey()
  },
  data () {
    return {
      hotKey: [],
      keyword: '',
      alertText: '确定清空所有搜索历史吗'
    }
  },
  computed: {
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    },
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    handleQuery (keyword) {
      this.keyword = keyword
    },
    clickHot (hot) {
      this.$refs.searchBox.setKeyword(hot)
    },
    blurInput () {
      this.$refs.searchBox.blur()
    },
    saveSearch () {
      this.saveSearchHistory(this.keyword)
    },
    clickSearchHistory (keyword) {
      // 当搜索历史中的关键字被点击时做两件事
      // 1.将关键字填入搜索框中
      // 2.将关键字保存在搜索历史中，主要是为了让这个关键字提前到第一个搜索历史，更加合理
      this.$refs.searchBox.setKeyword(keyword)
      this.saveSearchHistory(keyword)
    },
    showConfirm () {
      this.$refs.confirm.show()
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''

      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()

      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    _getHotKey () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.splice(0, 10)
        }
      })
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    keyword (newKeyword) {
      if (!newKeyword) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        })
      }
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
