<template>
  <div class="app-container">
    <splitpanes ref="mainSplit">
      <pane :size="splitSize[0]">
        <div class="split-container">
          <h2>分類</h2>
          <TableView
            ref="main"
            :data="data"
            :column-options="columnOptions[0]"
            :form="formBody[0]"
            :rules="rules[0]"
            class="table"
            :table-options="{isCanSelection:true}"
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
          <h2>{{ selectRow.name }} 原料</h2>
          <TableView
            ref="sub"
            :data="subData"
            :column-options="columnOptions[1]"
            :form="formBody[1]"
            class="table"
            :table-options="{isCanSelection:true}"
            :page="page[1]"
            :page-size="pageSize[1]"
            :rules="rules[1]"
            :target="1"
            :target-object="{label: selectRow}"
            :loading="loading[1]"
            @search="getSubDataset(selectRow.id,$event)"
            @refresh="getSubDataset(selectRow.id)"
            @delete="deleteSubDataset"
            @create="createSubDataset"
            @edit="editSubDataset"
            @select-row="onSelectSubRow"
            @size-change="handlePageSizeChange"
            @page-change="handlePageChange"
          />
        </div>
      </pane>
      <pane :size="splitSize[2]">
        <div v-if="selectSubRow&&Object.keys(selectSubRow).length>0" class="container">
          <h2>{{ selectSubRow.name }} 庫存紀錄</h2>
          <TableView
            ref="inner"
            :data="innerData"
            :column-options="columnOptions[2]"
            :form="formBody[2]"
            class="table"
            :page="page[2]"
            :page-size="pageSize[2]"
            :target="2"
            :target-object="{material: selectSubRow}"
            :rules="rules[2]"
            :loading="loading[2]"
            @search="getInnerDataset(selectSubRow.id,$event)"
            @refresh="getInnerDataset(selectSubRow.id)"
            @delete="deleteInnerDataset"
            @create="createInnerDataset"
            @edit="editInnerDataset"
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
  deleteLabel,
  deleteMaterial,
  getMaterialList,
  getLabelList,
  postLabel, postMaterial,
  putLabel, putMaterial, putStock, postStock, deleteStock, getStockForm, getStockList, getUnitList
} from '@/api/api'
import { Splitpanes, Pane } from 'splitpanes'
import TableView from '@/components/TableView'
import { notify } from '@/utils/notify'

export default {
  name: 'Menu',
  components: { Splitpanes, Pane, TableView },
  data() {
    return {
      loading: [false, false, false],
      page: [1, 1, 1],
      pageSize: [10, 10, 10],
      splitSize: [50, 50, 0],
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
        [{ 'label': '分類名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' }],
        [{
          'label': '分類',
          'field': 'label',
          'type': 'text',
          'inputType': 'el-select',
          dataset: this.getLabelSelection,
          options: { filterable: true }
        },
        { 'label': '名稱', 'field': 'name', 'type': 'text', 'inputType': 'el-input' },
        { 'label': '品牌名稱', 'field': 'brand', 'type': 'text', 'inputType': 'el-input' },
        {
          'label': '單位',
          'field': 'unit',
          'type': 'text',
          'inputType': 'el-select',
          dataset: this.getUnitSelection,
          options: { filterable: true }
        }],
        [{
          'label': '進貨時間',
          'field': 'stockDate',
          'type': 'date',
          'inputType': 'el-date-picker',
          options: { 'value-format': 'yyyy-MM-dd' }
        },
        {
          'label': '有效期限',
          'field': 'expiryDate',
          'type': 'date',
          'inputType': 'el-date-picker',
          options: { 'value-format': 'yyyy-MM-dd' }
        },
        { 'label': '原料', 'field': 'material', 'type': 'text', 'inputType': 'el-select', dataset: this.getMaterialSelection
        },
        {
          'label': '庫存',
          'field': 'stock',
          'type': 'decimal',
          'inputType': 'el-input-number'
        }]
      ]
    },
    columnOptions() {
      return [
        [{ 'label': 'ID', 'field': 'id' },
          { 'label': '分類名稱', 'field': 'name' }],
        [{ 'label': 'ID', 'field': 'id' },
          { 'label': '分類', 'field': 'label.name' },
          { 'label': '名稱', 'field': 'name' },
          { 'label': '品牌名稱', 'field': 'brand' },
          { 'label': '單位', 'field': 'unit.sign' }],
        [{ 'label': '進貨時間', 'field': 'stockDate' },
          { 'label': '有效期限', 'field': 'expiryDate' },
          { 'label': '原料', 'field': 'material' },
          { 'label': '庫存', 'field': 'stock' }]

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
      getLabelList(params)
        .then((res) => {
          this.data = res.data
          this.$refs['main'].createDialog = false
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
    getMaterialSelection() {
      return getMaterialList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    deleteDataset(row) {
      deleteLabel(row.id)
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
      postLabel(data)
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
      putLabel(row.id, row.data)
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
    //   getMaterialList('?columns=true')
    //     .then((res) => {
    //       this.subColumnOptions = res.data
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    getSubDataset(id, value) {
      this.$set(this.loading, 1, true)
      let params = '?label=' + id + '&page=' + this.page[1] + '&page_size=' + this.pageSize[1]
      if (value) {
        params += '&search=' + value
      }
      getMaterialList(params)
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
    // getSubFormBody() {
    //   getMaterialForm()
    //     .then((res) => {
    //       this.subFormBody = res.data
    //     })
    //     .catch((e) => {
    //       notify('error', 'Error', e, false)
    //     })
    // },
    deleteSubDataset(row) {
      deleteMaterial(row.id)
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
      postMaterial(data)
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
      putMaterial(row.id, row.data)
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
    getInnerDataset(id, value) {
      this.$set(this.loading, 2, true)
      let params = '?material=' + id + '&page=' + this.page[2] + '&page_size=' + this.pageSize[2]
      if (value) {
        params += '&search=' + value
      }
      getStockList(params)
        .then((res) => {
          this.innerData = res.data
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
        .finally(() => {
          this.$set(this.loading, 2, false)
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
