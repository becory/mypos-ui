<template>
  <div class="dashboard-editor-container components-container">
    <h2>單位</h2>
    <TableView
      ref="main"
      :data="data"
      :column-options="columnOptions"
      :form="formBody"
      class="table"
      :table-options="{isCanSelection:true}"
      :rules="rules"
      :loading="loading[0]"
      :page="page[0]"
      :page-size="pageSize[0]"
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
import { deleteUnit, getUnitForm, getUnitList, postUnit, putUnit } from '@/api/api'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'Unit',
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
      return [
        { 'label': '單位名稱', 'field': 'name' },
        { 'label': '單位符號', 'field': 'sign' }
      ]
    },
    formBody() {
      return [
        { 'label': '單位名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
        { 'label': '單位符號', 'field': 'sign', 'type': 'text', 'inputType': 'el-input' }
      ]
    },
    rules() {
      return {
        name: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        sign: [{ required: true, message: '必填欄位', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.getDataset()
  },
  methods: {
    getColumnOptions() {
      getUnitList('?columns=true')
        .then((res) => {
          this.columnOptions = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getDataset(value) {
      this.$set(this.loading, 0, true)
      let params = '?page=' + this.page[0] + '&page_size=' + this.pageSize[0]
      if (value) {
        params += '&search=' + value
      }
      getUnitList(params)
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
      getUnitForm()
        .then((res) => {
          this.formBody = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    deleteDataset(row) {
      deleteUnit(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    createDataset(data) {
      postUnit(data)
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
      putUnit(row.id, row.data)
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
