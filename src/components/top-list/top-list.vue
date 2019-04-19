<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex'
import MusicList from 'components/music-list/music-list'
import { getMusicList } from '../../api/rank'
import { ERR_OK } from '../../api/config'
import { createSong, isValidMusic, processSongsUrl } from '../../common/js/song'
export default {
  name: 'TopList',
  components: {
    MusicList
  },
  data () {
    return {
      songs: [],
      rank: true
    }
  },
  created () {
    this._getMusicList()
  },
  computed: {
    title () {
      return this.topList.topTitle
    },
    bgImage () {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'topList'
    ])
  },
  methods: {
    _getMusicList () {
      if (!this.topList.id) {
        this.$router.push({
          path: '/rank'
        })
      }
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
            this.songs = songs
            console.log(this.songs)
          })
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        let musicData = item.data
        // 筛选出不用付费的歌曲
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
