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
      :rules="rules"
      :page="page[0]"
      :page-size="pageSize[0]"
      :loading="loading[0]"
      @search="getDataset"
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
      loading: [false],
      page: [1],
      pageSize: [10],
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
    },
    rules() {
      return {
        name: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        itemType: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        startDate: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        endDate: [{ required: true, message: '必填欄位', trigger: 'blur' }]
      }
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
    getDataset(value) {
      this.$set(this.loading, 0, true)
      let params = '?page=' + this.page[0] + '&page_size=' + this.pageSize[0]
      if (value) {
        params += '&search=' + value
      }
      getMenuStatusList(params)
        .then((res) => {
          this.data = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, 0, false)
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
      deleteMenuStatus(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
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
</style>
