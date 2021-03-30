<template>
  <div class="dashboard-editor-container components-container">
    <h2>單位</h2>
    {{ formBody }}
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
import { deleteUnit, getUnitForm, getUnitList, postUnit, putUnit } from '@/api/api'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'Unit',
  components: { TableView },
  data() {
    return {
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
    }
  },
  mounted() {
    this.getColumnOptions()
    this.getFormBody()
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
    getDataset() {
      getUnitList('')
        .then((res) => {
          this.data = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
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
      this.$confirm('刪除顧客後，所有訂單將歸類為一般顧客，並且無法更改訂單資訊。', '確定刪除？', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUnit(row.id)
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

.left-container {
  background-color: #F38181;
  height: 100%;
}

.right-container {
  background-color: #FCE38A;
  height: 100%;
}
</style>
