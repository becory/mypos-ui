<template>
  <el-row>
    <el-col>
      <el-button
        ref="drag-button"
        v-touch:start="onStart()"
        v-touch:moving="onMove()"
        v-touch:end="onEnd()"
        type="success"
        icon="fas el-icon-fa-arrow-right"
        style="z-index: 999; position: absolute;"
      >{{ (mouseClick) ? '拉到底點一下' : null }}結帳
      </el-button>
      <p style="text-align: right;">總金額${{ total }}</p>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Index',
  props: {
    total: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      originX: 0,
      oW: 0,
      oLeft: 0,
      mouseClick: false
    }
  },
  computed: {
    test() {
      return {
        'orderDetails': [{
          'menuItem': ['Incorrect type. Expected pk value, received dict.'],
          'cook': { 'non_field_errors': ['Invalid data. Expected a dictionary, but got str.'] }
        }, {
          'menuItem': ['Incorrect type. Expected pk value, received dict.'],
          'cook': { 'non_field_errors': ['Invalid data. Expected a dictionary, but got str.'] }
        }, {
          'menuItem': ['Incorrect type. Expected pk value, received dict.'],
          'cook': { 'non_field_errors': ['Invalid data. Expected a dictionary, but got str.'] }
        }]
      }
    }
  },
  mounted() {
    this.originX = this.$refs['drag-button'].$el.clientWidth + 'px'
  },
  methods: {
    onStart() {
      const _this = this
      return function(event) {
        if (event.touches) {
          const touches = event.touches[0]
          _this.$refs['drag-button'].$el.style.position = 'absolute'
          _this.oW = touches.clientX - _this.$refs['drag-button'].$el.offsetLeft
        } else {
          _this.mouseClick = true
          _this.$refs['drag-button'].$el.style.position = 'absolute'
          _this.oW = event.clientX - _this.$refs['drag-button'].$el.offsetLeft
        }
      }
    },
    onMove() {
      const _this = this
      return function(event) {
        if (event.changedTouches) {
          const touches = event.changedTouches[0]
          _this.oLeft = touches.clientX - _this.oW
          if (_this.oLeft < 0) {
            _this.oLeft = 0
          } else if (_this.oLeft > _this.$el.clientWidth) {
            _this.oLeft = _this.$el.clientWidth
          }
          _this.$refs['drag-button'].$el.style.position = 'absolute'
          _this.$refs['drag-button'].$el.style.left = _this.oLeft + 'px'
        } else {
          if (_this.mouseClick) {
            _this.oLeft = event.clientX - _this.oW
            if (_this.oLeft < 0) {
              _this.oLeft = 0
            } else if (_this.oLeft > _this.$el.clientWidth) {
              _this.oLeft = _this.$el.clientWidth
            }
            _this.$refs['drag-button'].$el.style.position = 'absolute'
            _this.$refs['drag-button'].$el.style.left = _this.oLeft + 'px'
          }
        }
      }
    },
    onEnd() {
      const _this = this
      return function(event) {
        if (event.touches) {
          if (_this.oLeft >= _this.$el.clientWidth) {
            _this.$emit('submit')
          }
        } else {
          _this.mouseClick = false
          if (_this.oLeft >= _this.$el.clientWidth - (_this.$refs['drag-button'].$el.clientWidth / 2)) {
            _this.$emit('submit')
            _this.oLeft = 0
          }
        }
        _this.$refs['drag-button'].$el.style.position = 'absolute'
        _this.$refs['drag-button'].$el.style.left = '0px'
      }
    }
  }
}
</script>

<style scoped>

</style>
