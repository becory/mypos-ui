<template>
  <div class="dashboard-editor-container components-container">
    <h2>上架狀態設定</h2>
    <TableView
      ref="main"
      :data="data"
      :column-options="columnOptions"
      :form="formBody"
      class="table"
      :table-options="{isCanSelection:true}"
      @refresh="getDataset"
      @delete="deleteDataset"
      @create="createDataset"
      @edit="editDataset"
      @select-row="onSelectRow"
    />
  </div>
</template>

<script>
import {
  deleteMenuStatus,
  getMenuStatusForm,
  getMenuStatusList,
  getWeekList,
  postMenuStatus,
  putMenuStatus
} from '@/api/api'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'MenuStatus',
  components: { TableView },
  data() {
    return {
      data: [],
      selectRow: {}
    }
  },
  computed: {
    columnOptions() {
      return [{ 'label': '狀態名稱', 'field': 'name' },
        { 'label': '狀態', 'field': 'itemType' },
        { 'label': '開始日期', 'field': 'startDate' },
        { 'label': '結束日期', 'field': 'endDate' },
        { 'label': '販售星期', 'field': 'week' }]
    },
    formBody() {
      return [
        { 'label': '狀態名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
        {
          'label': '狀態',
          'field': 'itemType',
          'type': 'text',
          'inputType': 'el-radio-group',
          dataset: [{ value: 'N', label: '常態商品' }, { value: 'E', label: '週末' }, { value: 'W', label: '週間特別' },
            { value: 'S', label: '期間限定' }, { value: 'O', label: '下架' }]
        },
        {
          'label': '開始日期',
          'field': 'startDate',
          'type': 'date',
          'inputType': 'el-date-picker',
          options: { 'value-format': 'yyyy-MM-dd' }
        },
        {
          'label': '結束日期',
          'field': 'endDate',
          'type': 'date',
          'inputType': 'el-date-picker',
          options: { 'value-format': 'yyyy-MM-dd' }
        },
        {
          'label': '販售星期',
          'field': 'week',
          'type': 'select',
          'inputType': 'el-select',
          dataset: this.getWeekOptions,
          options: { multiple: true }
        }
      ]
    }
  },
  mounted() {
    // this.getColumnOptions()
    // this.getFormBody()
    this.getDataset()
  },
  methods: {
    getColumnOptions() {
      getMenuStatusList('?columns=true')
        .then((res) => {
          this.columnOptions = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getWeekOptions() {
      return getWeekList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getDataset() {
      getMenuStatusList('')
        .then((res) => {
          this.data = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getFormBody() {
      getMenuStatusForm()
        .then((res) => {
          this.formBody = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    deleteDataset(row) {
      this.$confirm('刪除顧客後，所有訂單將歸類為一般顧客，並且無法更改訂單資訊。', '確定刪除？', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenuStatus(row.id)
          .then((res) => {
            notify('success', 'Delete Success', res.data, false)
          })
          .catch((e) => {
            notify('error', 'Error', e, false)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    createDataset(data) {
      postMenuStatus(data)
        .then((res) => {
          notify('success', 'Create Success', res.data, false)
          this.$refs['main'].createDialog = false
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
          this.getDataset()
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    editDataset(row) {
      putMenuStatus(row.id, row.data)
        .then((res) => {
          notify('success', 'Edit Success', res.data, false)
          this.$refs['main'].createDialog = false
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
          this.getDataset()
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    onSelectRow(row) {
      this.selectRow = row
    }
  }
}
</script>

<style>
.components-container {
  position: relative;
  height: 70vh;
}

@media all and (min-width: 768px) {
  .components-container {
    position: relative;
    height: 85vh;
  }
}

.left-container {
  background-color: #F38181;
  height: 100%;
}

.right-container {
  background-color: #FCE38A;
  height: 100%;
}
</style>
