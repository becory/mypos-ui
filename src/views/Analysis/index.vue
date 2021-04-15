<template>
  <div class="app-container">
    <el-scrollbar :native="false" view-style="{width:100%; height:100%;}">
      <el-row>
        <el-col :md="12">
          <h1>報表<el-button icon="fas el-icon-fa-plus-circle" type="primary" @click="onAddChart">新增圖表</el-button>
          </h1>
        </el-col>
        <el-col :md="12" class="align-right">
          <el-form inline>
            <el-form-item>
              鎖定<el-switch v-model="canDrag" />拖移
            </el-form-item>
            <el-form-item>
              <el-date-picker v-model="date" type="daterange" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <draggable
          :list="chart"
          :draggable="'.item'"
          :disabled="!canDrag"
          ghost-class="ghost"
        >
          <el-col v-for="(item,idx) in chart" :key="idx" :md="item.width" class="item">
            <chart
              :index="idx"
              :data="data[idx]"
              :filter="item"
              :loading="loading[idx]"
              @change-width="onChangeWidth"
              @change-filter="onChangeFilter"
              @delete-chart="onDeleteChart"
            />
          </el-col>
        </draggable>
      </el-row>
    </el-scrollbar>
  </div>
</template>

<script>
import {
  getAnalysis, getAnalysisSetting, putAnalysisSetting
} from '@/api/api'
import { notify } from '@/utils/notify'
import Chart from '@/views/Analysis/compoments/chart'
import draggable from 'vuedraggable'
import { formatDate } from 'element-ui/src/utils/date-util'

export default {
  name: 'Customer',
  components: { Chart, draggable },
  data() {
    return {
      chart: [],
      data: [[]],
      loading: [],
      canDrag: false,
      date: [new Date().setDate(new Date().getDate() - 30), new Date().setDate(new Date().getDate() + 1)],
      count: 0
    }
  },
  watch: {
    chart: {
      deep: true,
      handler(val) {
        putAnalysisSetting(val)
          .then((res) => {
            // notify('success', 'update', res, false)
          })
          .catch((e) => {
            notify('error', 'Error', e, false)
          })
      }
    },
    date: {
      deep: true,
      handler() {
        this.chart = []
        this.getDataset()
      }
    }
  },
  mounted() {
    this.getDataset()
  },
  methods: {
    getDataset() {
      getAnalysisSetting()
        .then((res) => {
          this.chart = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getAnalysisData(index, app, name, value, aggregation) {
      this.$set(this.loading, index, true)
      this.count += 1
      let params = ''
      if (this.date) {
        params = '&start_date=' + formatDate(this.date[0], 'yyyy-MM-dd') + '&end_date=' + formatDate(this.date[1], 'yyyy-MM-dd')
      }
      getAnalysis(aggregation, app, name, value, params)
        .then((res) => {
          this.$set(this.data, index, res.data.result)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, index, false)
        })
    },
    onChangeWidth(value) {
      this.$set(this.chart[value['index']], 'width', value['width'])
    },
    onChangeFilter(value) {
      this.getAnalysisData(value['index'], value['app'], value['name'], value['value'], value['aggregation'])
      this.$set(this.chart, value['index'], value)
    },
    onAddChart() {
      this.chart.push({
        width: 8,
        app: 'Order',
        name: 'createDateTime',
        value: 'checkOutTotal',
        aggregation: 'Sum',
        chart: 'bar'
      })
      this.data.push([])
    },
    onDeleteChart(value) {
      this.chart.splice(this.chart.indexOf(value), 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 90vh;
  overflow-y: auto;
}
.item{
  padding-bottom: 10px;
}
</style>
