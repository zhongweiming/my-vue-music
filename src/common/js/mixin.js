import {mapGetters} from 'vuex'
// 调用这个mixin的组件会覆盖这里面的方法
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist (playlist) {
      // 要求引入了这个 mixin 的组件必须要实现这个方法
      // 因为各个组件不一样,各按所需来实现即可,不错!
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
