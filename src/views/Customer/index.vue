<template>
  <div class="app-container">
    <splitpanes ref="mainSplit">
      <pane :size="splitSize[0]">
        <div class="split-container">
          <h2>顧客</h2>
          <TableView
            ref="main"
            :data="data"
            :column-options="columnOptions[0]"
            :form="formBody[0]"
            class="table"
            :table-options="{isCanSelection:true, deleteMessage:'刪除顧客後，所有訂單將歸類為一般顧客，並且無法更改訂單資訊。'}"
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
          <h2>{{ selectRow.name }} 點餐記錄</h2>
          <TableView
            ref="sub"
            :data="subData"
            :column-options="columnOptions[1]"
            :form="formBody[1]"
            class="table"
            :page="page[1]"
            :page-size="pageSize[1]"
            :target="1"
            :target-object="{menu: selectRow}"
            :loading="loading[1]"
            @search="getSubDataset(selectRow.id, $event)"
            @refresh="getSubDataset(selectRow.id)"
            @delete="deleteSubDataset"
            @create="createSubDataset"
            @edit="editSubDataset"
            @size-change="handlePageSizeChange"
            @page-change="handlePageChange"
          />
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import {
  deleteCustomer,
  deleteOrder,
  getCustomerList,
  getOrderList,
  postCustomer,
  postOrder,
  putCustomer, putOrder
} from '@/api/api'
import { Splitpanes, Pane } from 'splitpanes'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'Customer',
  components: { Splitpanes, Pane, TableView },
  data() {
    return {
      loading: [false, false],
      page: [1, 1],
      pageSize: [10, 10],
      splitSize: [50, 50],
      data: [],
      selectRow: {},
      subData: []
    }
  },
  computed: {
    columnOptions() {
      return [
        [
          { 'label': 'ID', 'field': 'id', 'type': 'text', 'inputType': 'text' },
          { 'label': '顧客姓名', 'field': 'name', 'type': 'text', 'inputType': 'text' },
          { 'label': '電話', 'field': 'phone', 'type': 'text', 'inputType': 'text' },
          { 'label': '性別', 'field': 'gender', 'type': 'text', 'inputType': 'text' },
          { 'label': '年齡', 'field': 'age', 'type': 'number', 'inputType': 'number' }
        ],
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
            'type': 'date'
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
    formBody() {
      return [
        [
          { 'label': '顧客姓名', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
          { 'label': '電話', 'field': 'phone', 'type': 'text', 'inputType': 'el-input' },
          { 'label': '暗號', 'field': 'passcode', 'type': 'text', 'inputType': 'el-input' },
          {
            'label': '性別', 'field': 'gender', 'type': 'text', 'inputType': 'el-radio-group',
            dataset: [{ value: 'M', label: '男' }, { value: 'F', label: '女' }, { value: 'O', label: '其他' }]
          },
          { 'label': '年齡', 'field': 'age', 'type': 'number', 'inputType': 'el-input-number' }
        ]

      ]
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
      getCustomerList(params)
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
      deleteCustomer(row.id)
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
      postCustomer(data)
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
      putCustomer(row.id, row.data)
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
        this.splitSize = [30, 70]
        this.getSubDataset(row.id)
      }
    },
    getSubDataset(id, value) {
      this.$set(this.loading, 1, true)
      let params = '?customer=' + id + '&page=' + this.page[1] + '&page_size=' + this.pageSize[1]
      if (value) {
        params += '&search=' + value
      }
      getOrderList(params)
        .then((res) => {
          this.subData = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, 1, false)
        })
    },
    deleteSubDataset(row) {
      deleteOrder(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    createSubDataset(data) {
      postOrder(data)
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
      putOrder(row.id, row.data)
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
    handlePageSizeChange(val) {
      this.$set(this.pageSize, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
        case 1:
          return this.getSubDataset(this.selectRow.id)
      }
    },
    handlePageChange(val) {
      this.$set(this.page, val[0], val[1])
      switch (val[0]) {
        case 0:
          return this.getDataset()
        case 1:
          return this.getSubDataset(this.selectRow.id)
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
