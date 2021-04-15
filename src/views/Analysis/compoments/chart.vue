<template>
  <el-card v-loading="loading">
    <div slot="header" class="align-right">
      <template v-if="edit">
        <el-select v-model="width" style="width:100px">
          <el-option :value="6" label="1/4頁寬" />
          <el-option :value="8" label="1/3頁寬" />
          <el-option :value="12" label="1/2頁寬" />
          <el-option :value="24" label="整頁寬" />
        </el-select>
        <el-select v-model="app" style="width:100px">
          <el-option v-for="(item,idx) in selection.App" :key="idx" :value="item.value" :label="item.label" />
        </el-select>
        <el-select v-model="name" style="width:100px">
          <el-option v-for="(item,idx) in selection.Columns" :key="idx" :value="item.value" :label="item.label" />
        </el-select>
        <el-select v-model="value" style="width:100px">
          <el-option v-for="(item,idx) in selection.Value" :key="idx" :value="item.value" :label="item.label" />
        </el-select>
        <el-select v-model="aggregation" style="width:100px">
          <el-option v-for="(item,idx) in selection.aggregation" :key="idx" :value="item.value" :label="item.label" />
        </el-select>
        <el-select v-model="chart" style="width:100px">
          <el-option v-for="(item,idx) in selection.chart" :key="idx" :value="item.value" :label="item.label" />
        </el-select>
        <el-button type="primary" icon="fas el-icon-fa-times" @click="edit=false;" />
      </template>
      <template v-else>
        <el-button type="primary" icon="fas el-icon-fa-edit" @click="edit=true;" />
        <el-button type="danger" icon="fas el-icon-fa-trash-alt" @click="deleteChart" />
      </template>
    </div>
    <v-chart :key="reload" :options="options" style="width:100%;" theme="macarons" />
  </el-card>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'element-ui/lib/theme-chalk/display.css'
import { getAnalysisApp, getAnalysisColumns, getAnalysisValue } from '@/api/api'

require('echarts/theme/macarons') // echarts theme

export default {
  name: 'Chart',
  components: {
    'v-chart': ECharts
  },
  props: {
    index: {
      type: Number,
      default: 0
    },
    data: {
      type: Array,
      default: () => ([])
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      width: 6,
      app: null,
      name: null,
      value: null,
      aggregation: null,
      chart: null,
      reload: 0,
      selection: { Columns: [], Value: [] },
      edit: false,
      init: true
    }
  },
  computed: {
    xAxisData() {
      return this.data.map((name) => (name.name))
    },
    series() {
      return this.data.map((name) => (name.value))
    },
    options() {
      const title = this.translateLabel('Columns', this.name) + ' 的 ' + this.translateLabel('Value', this.value) + ' ' + this.translateLabel('aggregation', this.aggregation) + this.translateLabel('chart', this.chart)
      const subTitle = this.translateLabel('App', this.app)
      switch (this.chart) {
        case 'bar':
          return {
            title: {
              text: title,
              subtext: subTitle
            },
            xAxis: {
              type: 'category',
              data: this.xAxisData
            },
            yAxis: {},
            series: [
              {
                name: 'bar',
                type: 'bar',
                showSymbol: false,
                data: this.series
              }
            ],
            animationDuration: 500
          }
        case 'line':
          return {
            title: {
              text: title,
              subtext: subTitle
            },
            xAxis: {
              type: 'category',
              data: this.xAxisData
            },
            yAxis: {},
            series: [
              {
                name: 'line',
                type: 'line',
                showSymbol: false,
                data: this.series
              }
            ],
            animationDuration: 500
          }
        case 'pie':
          return {
            title: {
              text: title,
              subtext: subTitle
            },
            tooltip: {
              trigger: 'name'
            },
            legend: {
              orient: 'vertical',
              bottom: 'bottom'
            },
            series: [
              {
                name: 'pie',
                type: 'pie',
                data: this.data
              }
            ],
            animationDuration: 500
          }
      }
      return {}
    }
  },
  watch: {
    width() {
      this.reload += 1
      this.$emit('change-width', { index: this.index, width: this.width })
    },
    async app(value) {
      this.reload += 1
      this.$set(this.selection, 'Columns', [])
      this.$set(this.selection, 'Value', [])
      const column = await this.getAnalysisColumnsOptions(value)
      const columns_index = column.findIndex((item) => (item.value === this.name))
      if (columns_index < 0) {
        this.name = column[0].value
      }
      const chartValue = await this.getAnalysisValueOptions(value)
      const value_index = chartValue.findIndex((item) => (item.value === this.value))
      if (value_index < 0) {
        this.value = chartValue[0].value
      }
      if (!this.init) {
        await this.updateChart()
      }
    },
    name() {
      this.reload += 1
      const value_index = this.selection['Columns'].findIndex((item) => (item.value === this.value))
      if (value_index < 0) {
        this.value = this.selection['Columns'][0].value
      }
      if (!this.init && this.selection['Columns'].length > 0) {
        this.updateChart()
      }
    },
    value() {
      this.reload += 1
      const value_index = this.selection['Value'].findIndex((item) => (item.value === this.value))
      console.log(this.selection['Value'])
      if (value_index < 0 && this.selection['Value'].length > 0) {
        this.value = this.selection['Value'][0].value
      }
      if (!this.init && this.selection['Value'].length > 0) {
        this.updateChart()
      }
    },
    aggregation() {
      this.reload += 1
      if (!this.init) {
        this.updateChart()
      }
    },
    chart() {
      this.reload += 1
      if (!this.init) {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.$set(this.selection, 'aggregation', [
      { label: '平均', value: 'Avg' },
      { label: '加總', value: 'Sum' },
      { label: '筆數', value: 'Count' },
      { label: '最小', value: 'Min' },
      { label: '最大', value: 'Max' }])
    this.$set(this.selection, 'chart', [
      { label: '長條圖', value: 'bar' },
      { label: '折線圖', value: 'line' },
      { label: '圓餅圖', value: 'pie' }
    ])
    this.initAnalysis().then(() => {
      this.init = false
    })
  },
  methods: {
    async initAnalysis() {
      Object.keys(this.filter).forEach((item) => {
        this[item] = this.filter[item]
      })
      await this.getAnalysisAppOptions()
      const res = await this.updateChart()
      return Promise.resolve(res)
    },
    getAnalysisAppOptions() {
      getAnalysisApp()
        .then((res) => {
          this.$set(this.selection, 'App', res.data.result)
        })
    },
    getAnalysisColumnsOptions(app) {
      return getAnalysisColumns(app)
        .then((res) => {
          this.$set(this.selection, 'Columns', res.data.result)
          return Promise.resolve(res.data.result)
        })
    },
    getAnalysisValueOptions(app) {
      return getAnalysisValue(app)
        .then((res) => {
          this.$set(this.selection, 'Value', res.data.result)
          return Promise.resolve(res.data.result)
        })
    },
    updateChart() {
      const list = ['width', 'app', 'name', 'value', 'aggregation', 'chart']
      const condition = list.reduce((total, current) => ((!!this[current]) && total), true)
      if (condition) {
        this.$emit('change-filter', {
          index: this.index,
          width: this.width,
          app: this.app,
          name: this.name,
          value: this.value,
          aggregation: this.aggregation,
          chart: this.chart
        })
      }
      return Promise.resolve(true)
    },
    deleteChart() {
      this.$emit('delete-chart', {
        index: this.index,
        width: this.width,
        app: this.app,
        name: this.name,
        value: this.value,
        aggregation: this.aggregation,
        chart: this.chart
      })
    },
    translateLabel(from, value) {
      if (this.selection[from]) {
        const findValue = this.selection[from].find((item) => (item.value === value))
        if (findValue) {
          return findValue.label
        }
      }
      return value
    }
  }
}
</script>

<style>
</style>
