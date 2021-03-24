<template>
  <div class="dashboard-editor-container components-container">
    <split-pane :min-percent="20" :default-percent="30" split="vertical">
      <template slot="paneL">
        <h2>顧客</h2>
        <TableView
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
      </template>
      <template slot="paneR">
        <div class="right-container">
          <div v-if="Object.keys(selectRow).length>0">
            <h2>{{ selectRow.name }} 的點餐記錄</h2>
            <TableView
              :data="data"
              :column-options="columnOptions"
              :form="formBody"
              class="table"
              @refresh="getDataset"
              @delete="deleteDataset"
              @create="createDataset"
              @edit="editDataset"
            />
          </div>
        </div>
      </template>
    </split-pane>
  </div>
</template>

<script>
import { deleteCustomer, getCustomerForm, getCustomerList, postCustomer, putCustomer } from '@/api/api'
import splitPane from 'vue-splitpane'
import TableView from '@/components/TableView'

export default {
  name: 'Customer',
  components: { splitPane, TableView },
  data() {
    return {
      data: [],
      columnOptions: [],
      formBody: [],
      selectRow: {}
    }
  },
  mounted() {
    this.getColumnOptions()
    this.getFormBody()
    this.getDataset()
  },
  methods: {
    getColumnOptions() {
      getCustomerList('?columns=true')
        .then((res) => {
          this.columnOptions = res.data
        })
    },
    getDataset() {
      getCustomerList('')
        .then((res) => {
          this.data = res.data.result
        })
    },
    getFormBody() {
      getCustomerForm()
        .then((res) => {
          this.formBody = res.data
        })
    },
    deleteDataset(row) {
      deleteCustomer(row.id)
        .then(() => {
          console.log(row.id)
        })
    },
    createDataset(data) {
      postCustomer(data)
        .then(() => {
          console.log(data)
        })
    },
    editDataset(row) {
      putCustomer(row.id, row.data)
        .then(() => {
          console.log(row.id)
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
