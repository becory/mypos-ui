<template>
  <div class="app-container">
    <splitpanes ref="mainSplit">
      <pane :size="splitSize[0]">
        <div class="split-container">
          <h2>歷史訂單查詢</h2>
          <TableView
            ref="main"
            :data="data"
            :column-options="columnOptions[0]"
            :form="formBody[0]"
            :rules="rules[0]"
            class="table"
            :table-options="{isCanSelection:true, disableCreate:true}"
            :page="page[0]"
            :page-size="pageSize[0]"
            :target="0"
            :loading="loading[0]"
            @search="getDataset"
            @refresh="getDataset"
            @delete="deleteDataset"
            @create="createDataset"
            @edit="editDataset"
            @select-row="onSelectRow"
            @size-change="handlePageSizeChange"
            @page-change="handlePageChange"
          />
        </div>
      </pane>
      <pane :size="splitSize[1]">
        <div v-if="selectRow&&Object.keys(selectRow).length>0" class="split-container">
          <el-card v-loading="loading[1]">
            <template slot="header">
              <b>{{ selectRow.id }} 訂單內容</b>
            </template>
            <el-row>
              <el-col :md="6">
                <el-timeline ref="timeline">
                  <template v-for="(item, idx) in subData['timeline']">
                    <el-timeline-item v-if="item.timestamp" :key="idx" :timestamp="item.timestamp">
                      {{ $t('ORDER.'+item.content) }}
                    </el-timeline-item>
                  </template>
                </el-timeline>
              </el-col>
              <el-col :md="18">
                <KeyValueView :data="subData['result']" :format-func="formatValue" />
              </el-col>
            </el-row>
          </el-card>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import {
  deleteOrder,
  getOrder,
  getLabelList,
  postOrder,
  postOrderDetail,
  putOrder,
  putOrderDetail,
  putStock,
  postStock,
  deleteStock,
  getStockForm,
  getStockList,
  getUnitList,
  getMenuList,
  getOrderStatusList, getCustomerList, getOrderList
} from '@/api/api'
import { Splitpanes, Pane } from 'splitpanes'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'
import KeyValueView from '@/components/TableView/KeyValueView'

export default {
  name: 'Menu',
  components: { Splitpanes, Pane, TableView, KeyValueView },
  data() {
    return {
      loading: [false, false],
      page: [1, 1],
      pageSize: [10, 10],
      splitSize: [50, 50],
      data: [],
      selectRow: {},
      subData: [],
      selectSubRow: {},
      innerData: []
    }
  },
  computed: {
    formBody() {
      return [
        [
          {
            'label': '訂單狀態',
            'field': 'status',
            'type': 'text',
            'inputType': 'el-select',
            dataset: this.getStatusSelection,
            options: { filterable: true }

          },
          {
            'label': '顧客',
            'field': 'customer',
            'type': 'text',
            'inputType': 'el-select',
            dataset: this.getCustomerSelection,
            options: { filterable: true }
          },
          {
            'label': '已結帳',
            'field': 'checkOut',
            'type': 'text',
            'inputType': 'el-switch'
          },
          {
            'label': '序號',
            'field': 'orderID',
            'type': 'number',
            'inputType': 'el-input-number'
          },
          {
            'label': '桌號',
            'field': 'desk',
            'type': 'number',
            'inputType': 'el-input-number'
          },
          {
            'label': '訂單來源',
            'field': 'orderFrom',
            'type': 'text',
            'inputType': 'el-radio-group',
            dataset: [
              { value: 'C', label: '顧客點餐' },
              { value: 'S', label: '來店點餐' },
              { value: 'F', label: 'FoodPanda' },
              { value: 'U', label: 'UberEats' }
            ]
          },
          {
            'label': '點餐內容',
            'field': 'orderDetails',
            'type': 'text',
            'inputType': 'OrderDetailField',
            dataset: this.getMenuSelection,
            options: { options: { master: 'menu', child: 'menuItem', combineField: 'menuItemValue', value: 'count' }}
          }
        ]
      ]
    },
    columnOptions() {
      return [
        [
          {
            'label': '訂單狀態',
            'field': 'status.name',
            'type': 'text',
            'inputType': 'el-select'
          },
          {
            'label': '顧客',
            'field': 'customer.name',
            'type': 'text',
            'inputType': 'el-select'
          },
          {
            'label': '結帳狀況',
            'field': 'checkOut',
            'type': 'text',
            'inputType': 'el-radio-group'
          },
          {
            'label': '序號',
            'field': 'orderID',
            'type': 'number',
            'inputType': 'number'
          },
          {
            'label': '桌號',
            'field': 'desk',
            'type': 'number',
            'inputType': 'number'
          },
          {
            'label': '產生時間',
            'field': 'createDateTime',
            'type': 'date',
            'inputType': 'datetime',
            'dateInputFormat': "yyyy-MM-dd'T'HH:mm:ss",
            'dateOutputFormat': 'yyyy-MM-dd',
            'formatFn': 'function (value) { return value != null ? value : null}'
          },
          {
            'label': '訂單來源',
            'field': 'orderFrom',
            'type': 'text',
            'inputType': 'text'
          }
        ]
      ]
    },
    rules() {
      return [
        { name: [{ required: true, message: '必填欄位', trigger: 'blur' }] },
        {
          name: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          label: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          brand: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          unit: [{ required: true, message: '必填欄位', trigger: 'blur' }]
        },
        {
          stockDate: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          expiryDate: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          material: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          stock: [{ required: true, message: '必填欄位', trigger: 'blur' }]
        }]
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
      getOrderList(params)
        .then((res) => {
          this.data = res.data
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, 0, false)
        })
    },
    getStatusSelection() {
      return getOrderStatusList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getCustomerSelection() {
      return getCustomerList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getMenuSelection() {
      return getMenuList('?selection=name&children=menuID')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getLabelSelection() {
      return getLabelList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getUnitSelection() {
      return getUnitList('?selection=sign')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    // getOrderDetailSelection() {
    //   return getOrderDetailList('?selection=sign')
    //     .then((res) => {
    //       return Promise.resolve(res.data)
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //       return Promise.reject()
    //     })
    // },
    deleteDataset(row) {
      deleteOrder(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
          this.getDataset()
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    createDataset(data) {
      postOrder(data)
        .then((res) => {
          notify('success', 'Create Success', res.data, false)
          this.$refs['main'].createDialog = false
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
          this.getDataset()
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    editDataset(row) {
      putOrder(row.id, row.data)
        .then((res) => {
          notify('success', 'Edit Success', res.data, false)
          this.$refs['main'].createDialog = false
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
          this.getDataset()
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    onSelectRow(row) {
      this.selectRow = row
      if (row) {
        this.splitSize = [50, 50, 0]
        this.getSubDataset(row.id)
      }
    },
    // getSubColumnOptions() {
    //   getOrderDetailList('?columns=true')
    //     .then((res) => {
    //       this.subColumnOptions = res.data
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    getSubDataset(id) {
      this.$set(this.loading, 1, true)
      getOrder(id)
        .then((res) => {
          const data = res.data
          const tableResult = {}
          Object.keys(data).forEach((item) => {
            if (['timeline', 'status'].indexOf(item) < 0) {
              tableResult[item] = data[item]
            }
          })
          this.subData = { status: data['status'], timeline: data['timeline'], result: tableResult }
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, 1, false)
        })
    },
    // getSubFormBody() {
    //   getOrderDetailForm()
    //     .then((res) => {
    //       this.subFormBody = res.data
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    // deleteSubDataset(row) {
    //   deleteOrderDetail(row.id)
    //     .then((res) => {
    //       notify('success', 'Delete Success', res.data, false)
    //       this.getSubDataset(this.selectRow.id)
    //     })
    //     .catch((e) => {
    //       if (e.response) {
    //         return notify('error', 'Error', e.response.data, false)
    //       }
    //       return notify('error', 'Error', e, false)
    //     })
    // },
    createSubDataset(data) {
      postOrderDetail(data)
        .then((res) => {
          notify('success', 'Create Success', res.data, false)
          this.$refs['sub'].createDialog = false
          this.$refs['sub'].formBody = {}
          this.$refs['sub'].editItem = {}
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    editSubDataset(row) {
      putOrderDetail(row.id, row.data)
        .then((res) => {
          notify('success', 'Edit Success', res.data, false)
          this.$refs['sub'].createDialog = false
          this.$refs['sub'].formBody = {}
          this.$refs['sub'].editItem = {}
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    onSelectSubRow(row) {
      this.selectSubRow = row
      if (row) {
        this.splitSize = [20, 30, 50]
        this.getInnerDataset(row.id)
      }
    },
    // getInnerColumnOptions() {
    //   getStockList('?columns=true')
    //     .then((res) => {
    //       this.innerColumnOptions = res.data
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    getInnerDataset(id) {
      getStockList('?material=' + id + '&page=' + this.page[2] + '&page_size=' + this.pageSize[2])
        .then((res) => {
          this.innerData = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getInnerFormBody() {
      getStockForm()
        .then((res) => {
          this.innerFormBody = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    deleteInnerDataset(row) {
      deleteStock(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
          this.getInnerDataset(this.selectSubRow.id)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    createInnerDataset(data) {
      postStock(data)
        .then((res) => {
          notify('success', 'Create Success', res.data, false)
          this.$refs['inner'].createDialog = false
          this.$refs['inner'].formBody = {}
          this.$refs['inner'].editItem = {}
          this.getInnerDataset(this.selectSubRow.id)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    editInnerDataset(row) {
      putStock(row.id, row.data)
        .then((res) => {
          notify('success', 'Edit Success', res.data, false)
          this.$refs['inner'].createDialog = false
          this.$refs['inner'].formBody = {}
          this.$refs['inner'].editItem = {}
          this.getInnerDataset(this.selectSubRow.id)
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    handlePageSizeChange(val) {
      this.$set(this.pageSize, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
        case 1:
          return this.getSubDataset(this.selectRow.id)
        case 2:
          return this.getInnerDataset(this.selectSubRow.id)
      }
    },
    handlePageChange(val) {
      this.$set(this.page, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
        case 1:
          return this.getSubDataset(this.selectRow.id)
        case 2:
          return this.getInnerDataset(this.selectSubRow.id)
      }
    },
    formatValue(key, value) {
      switch (key) {
        case 'menuItem':
          return value['name'] + '(現價：' + value['price'] + '$)'
        default:
          return value['name']
      }
    }
  }
}
</script>

<style lang="scss">
@import '~splitpanes/dist/splitpanes.css';

.app-container {
  position: relative;
  height: 90vh;
}

.split-container {
  height: 100%;
  padding: 10px;
  overflow: scroll;
}

.splitpanes {
}

.splitpanes__splitter {
  background-color: #ccc;
  position: relative;
}

.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(255, 0, 0, 0.3);
  opacity: 0;
  z-index: 1;
}

.splitpanes__splitter:hover:before {
  opacity: 1;
}

.splitpanes--vertical > .splitpanes__splitter:before {
  left: -30px;
  right: -30px;
  height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -30px;
  bottom: -30px;
  width: 100%;
}

</style>
