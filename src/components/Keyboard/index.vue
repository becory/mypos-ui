<template>
  <el-card>
    <el-row v-for="(item, index) in button" :key="index" :gutter="10" class="row-button">
      <el-col v-for="(subItem,idx) in item" :key="idx" :span="8">
        <el-button @click="onClick(subItem)">{{ subItem }}</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="16">
        <el-button @click="onClick(0)">0</el-button>
      </el-col>
      <el-col :span="8">
        <el-button type="danger" @click="onClick('C')">C</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  name: 'Index',
  computed: {
    button() {
      return [[7, 8, 9], [4, 5, 6], [1, 2, 3]]
    }
  },
  methods: {
    onClick(item) {
      this.$emit('clickKeyboard', item)
    }
  }
}
</script>

<style scoped>
.el-button {
  width: 100%;
  height: 100%;
  text-align: center;
}
.row-button{
  min-height: 2em;
  margin-bottom: 0.5em;
}
</style>
