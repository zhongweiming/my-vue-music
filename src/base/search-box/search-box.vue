<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="keyword" :placeholder="placeholder" class="box"/>
    <i class="icon-dismiss" v-show="keyword" @click="clearInput"></i>
  </div>
</template>

<script type="text/ecmascript-6">
import { debounce } from '../../common/js/util'

export default {
  name: 'SearchBox',
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      keyword: ''
    }
  },
  methods: {
    clearInput () {
      this.keyword = ''
    },
    setKeyword (keyword) {
      this.keyword = keyword
    }
  },
  created () {
    this.$watch('keyword', debounce((newKeyword) => {
      this.$emit('query', newKeyword)
    }, 200))
  },
  blur () {
    this.$refs.query.blur()
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      outline: 0
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
