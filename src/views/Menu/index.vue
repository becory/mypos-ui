<template>
  <div class="app-container">
    <splitpanes ref="mainSplit">
      <pane :size="splitSize[0]">
        <div class="split-container">
          <h2>Menu</h2>
          <TableView
            ref="main"
            :data="data"
            :column-options="columnOptions[0]"
            :form="formBody[0]"
            class="table"
            :table-options="{isCanSelection:true}"
            :page="page[0]"
            :page-size="pageSize[0]"
            :target="0"
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
          <h2>{{ selectRow.name }} 的點餐記錄</h2>
          <TableView
            ref="sub"
            :data="subData"
            :column-options="columnOptions[1]"
            :form="formBody[1]"
            class="table"
            :table-options="{isCanUpload:true}"
            name="/Menu/MenuItem/"
            :page="page[1]"
            :page-size="pageSize[1]"
            :rules="rules[1]"
            :target="1"
            :target-object="{menu: selectRow}"
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
  deleteMenu,
  deleteMenuItem,
  getMenuStatusList,
  getMenuItemForm,
  getMenuItemList,
  getMenuList,
  postMenu, postMenuItem,
  putMenu, putMenuItem
} from '@/api/api'
import { Splitpanes, Pane } from 'splitpanes'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'Menu',
  components: { Splitpanes, Pane, TableView },
  data() {
    return {
      page: [1, 1],
      pageSize: [1, 1],
      splitSize: [50, 50],
      data: [],
      selectRow: {},
      subData: []
    }
  },
  computed: {
    formBody() {
      return [
        [{ 'label': '分類名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
          {
            'label': '顧客操作',
            'field': 'customerAction',
            'type': 'boolean',
            'inputType': 'el-radio-group',
            'dataset': [{ id: true, name: '是' }, { id: false, name: '否' }]
          },
          {
            'label': '顯示',
            'field': 'visible',
            'type': 'boolean',
            'inputType': 'el-radio-group',
            'dataset': [{ id: true, name: '是' }, { id: false, name: '否' }]
          }
        ],
        [{ 'label': '餐點名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
          { 'label': '目錄分類', 'field': 'menu', 'type': 'text', 'inputType': 'el-select', dataset: this.getMenuSelection },
          { 'label': '價格', 'field': 'price', 'type': 'decimal', 'inputType': 'el-input-number' },
          { 'label': '描述', 'field': 'description', 'type': 'text', 'inputType': 'el-input' },
          { 'label': '上架狀態', 'field': 'status', 'type': 'text', 'inputType': 'el-select', dataset: this.getMenuStatusSelection },
          { 'label': '食譜', 'field': 'recipes', 'type': 'select', 'inputType': 'MaterialField' },
          { 'label': '套餐內容', 'field': 'menuSet', 'type': 'select', 'inputType': 'el-select', dataset: this.getMenuItemSelection, options: { multiple: true, filterable: true }}]
      ]
    },
    // , dataset: this.getMaterialSelection
    columnOptions() {
      return [
        [{ 'label': 'ID', 'field': 'id' },
          { 'label': '分類名稱', 'field': 'name' },
          { 'label': '顧客操作', 'field': 'customerAction' },
          { 'label': '顯示', 'field': 'visible' }
        ],
        [{ 'label': 'ID', 'field': 'id' },
          { 'label': '餐點名稱', 'field': 'name' },
          { 'label': '目錄分類', 'field': 'menu' },
          { 'label': 'image', 'field': 'image' },
          { 'label': '價格', 'field': 'price' },
          { 'label': '描述', 'field': 'description' },
          { 'label': '上架狀態', 'field': 'status.name' }]

      ]
    },
    rules() {
      return [[],
        { name: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          menu: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          price: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          description: [{ required: true, message: '必填欄位', trigger: 'blur' }],
          status: [{ required: true, message: '必填欄位', trigger: 'blur' }] }]
    }
  },
  mounted() {
    this.getDataset()
  },
  methods: {
    getDataset() {
      getMenuList('')
        .then((res) => {
          this.data = res.data
          this.$refs['main'].createDialog = false
          this.$refs['main'].formBody = {}
          this.$refs['main'].editItem = {}
        })
        .catch((e) => {
          // notify('error', 'Error', e, false)
        })
    },
    getMenuSelection() {
      return getMenuList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getMenuStatusSelection() {
      return getMenuStatusList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getMenuItemSelection() {
      return getMenuItemList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    deleteDataset(row) {
      deleteMenu(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    createDataset(data) {
      postMenu(data)
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
      putMenu(row.id, row.data)
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
      if (row) {
        this.splitSize = [30, 70]
        this.getSubDataset(row.id)
      }
    },
    getSubColumnOptions() {
      getMenuItemList('?columns=true')
        .then((res) => {
          this.subColumnOptions = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getSubDataset(id) {
      getMenuItemList('?menu=' + id + '&page=' + this.page[1] + '&page_size=' + this.pageSize[1])
        .then((res) => {
          this.subData = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getSubFormBody() {
      getMenuItemForm()
        .then((res) => {
          this.subFormBody = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    deleteSubDataset(row) {
      deleteMenuItem(row.id)
        .then((res) => {
          notify('success', 'Delete Success', res.data, false)
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    createSubDataset(data) {
      postMenuItem(data)
        .then((res) => {
          notify('success', 'Create Success', res.data, false)
          this.$refs['sub'].createDialog = false
          this.$refs['sub'].formBody = {}
          this.$refs['sub'].editItem = {}
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          if (e.response) {
            // Request made and server responded
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    editSubDataset(row) {
      putMenuItem(row.id, row.data)
        .then((res) => {
          notify('success', 'Edit Success', res.data, false)
          this.$refs['sub'].createDialog = false
          this.$refs['sub'].formBody = {}
          this.$refs['sub'].editItem = {}
          this.getSubDataset(this.selectRow.id)
        })
        .catch((e) => {
          if (e.response) {
            // Request made and server responded
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
