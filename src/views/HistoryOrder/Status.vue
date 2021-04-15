<template>
  <div class="dashboard-editor-container components-container">
    <h2>訂單狀態順序設定</h2>
    <TableView
      ref="main"
      :data="data"
      :column-options="columnOptions"
      :form="formBody"
      class="table"
      :table-options="{isCanSelection:true,disableDelete:true, disableCreate: true}"
      :rules="rules"
      :page="page[0]"
      :page-size="pageSize[0]"
      :loading="loading[0]"
      @search="getDataset"
      @refresh="getDataset"
      @delete="deleteDataset"
      @edit="editDataset"
      @select-row="onSelectRow"
      @size-change="handlePageSizeChange"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script>
import {
  deleteOrderStatus,
  getOrderStatusList,
  // postOrderStatus,
  putOrderStatus
} from '@/api/api'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'OrderStatus',
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
        {
          'label': '狀態名稱',
          'field': 'name'
        },
        {
          'label': '狀態英文名稱',
          'field': 'className'
        },
        {
          'label': '狀態圖示',
          'field': 'icon'
        },
        {
          'label': '順序',
          'field': 'orderNo'
        },
        {
          'label': '顯示',
          'field': 'visible'
        }
      ]
    },
    formBody() {
      return [
        {
          'label': '狀態名稱',
          'field': 'name',
          'type': 'text',
          'inputType': 'el-input'
        },
        {
          'label': '狀態英文名稱',
          'field': 'className',
          'type': 'text',
          'inputType': 'el-input'
        },
        {
          'label': '狀態圖示',
          'field': 'icon',
          'type': 'text',
          'inputType': 'el-input'
        },
        {
          'label': '順序',
          'field': 'orderNo',
          'type': 'number',
          'inputType': 'el-input-number'
        },
        {
          'label': '顯示',
          'field': 'visible',
          'type': 'boolean',
          'inputType': 'el-radio-group',
          'dataset': [{ value: true, label: '是' }, { value: false, label: '否' }]
        }
      ]
    },
    rules() {
      return {
        name: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        className: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        icon: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        orderNo: [{ required: true, message: '必填欄位', trigger: 'blur' }],
        visible: [{ required: true, message: '必填欄位', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.getDataset()
  },
  methods: {
    getDataset(value) {
      this.$set(this.loading, 0, true)
      let params = '?page=' + this.page[0] + '&page_size=' + this.pageSize[0]
      if (value) {
        params += '&search=' + value
      }
      getOrderStatusList(params)
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
    deleteDataset(row) {
      deleteOrderStatus(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    // createDataset(data) {
    //   postOrderStatus(data)
    //     .then((res) => {
    //       notify('success', 'Create Success', res.data, false)
    //       this.$refs['main'].createDialog = false
    //       this.$refs['main'].formBody = {}
    //       this.$refs['main'].editItem = {}
    //       this.getDataset()
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    editDataset(row) {
      putOrderStatus(row.id, row.data)
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
    },
    handlePageSizeChange(val) {
      this.$set(this.pageSize, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
      }
    },
    handlePageChange(val) {
      this.$set(this.page, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
      }
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
