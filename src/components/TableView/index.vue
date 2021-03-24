<template>
  <div>
    <el-row>
      <el-col :md="12">
        <el-button type="primary" icon="fas el-icon-fa-plus" @click="onCreate">新增</el-button>
      </el-col>
      <el-col :md="12" class="align-right">
        <el-button type="primary" icon="fas el-icon-fa-sync-alt" @click="onRefresh" />
      </el-col>
    </el-row>
    <el-table
      :data="data"
      class="table"
      :highlight-current-row="tableOptions['isCanSelection']"
      @current-change="handleCurrentChange"
    >
      <el-table-column label="操作" fixed="right" align="right">
        <template slot-scope="scope">
          <el-button type="info" size="small" icon="fas el-icon-fa-edit" @click="onEdit(scope.row)" />
          <el-button
            type="danger"
            size="small"
            icon="fas el-icon-fa-trash-alt"
            @click="onDelete(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-for="(column,idx) in columnOptions"
        :key="idx"
        :prop="column.field"
        :label="column.label"
        :fixed="column.fixed"
      />
    </el-table>
    <el-dialog :visible.sync="createDialog" :title="mode">
      <el-form>
        <el-form-item v-for="(input,idx) in form" :key="idx" :label="input.label">
          <el-input v-model="formBody[input.field]" :type="input.type" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">Submit</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Index',
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    columnOptions: {
      type: Array,
      default: () => ([])
    },
    form: {
      type: Array,
      default: () => ([])
    },
    tableOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      createDialog: false,
      formBody: {},
      editID: null,
      editItem: {},
      editing: false
    }
  },
  computed: {
    mode() {
      if (this.editing) {
        return '編輯'
      }
      return '建立'
    }
  },
  methods: {
    onCreate() {
      this.formBody = {}
      this.editItem = {}
      this.editID = null
      this.editing = false
      this.createDialog = true
    },
    onRefresh() {
      this.$emit('refresh')
    },
    onEdit(row) {
      this.formBody = JSON.parse(JSON.stringify(row))
      this.editItem = JSON.parse(JSON.stringify(row))
      this.editID = row.id
      this.editing = true
      this.createDialog = true
      // this.$emit('edit', row)
    },
    onDelete(row) {
      this.$emit('delete', row)
    },
    onSubmit() {
      if (this.editing) {
        this.$emit('edit', { id: this.editID, data: this.formBody })
      } else {
        this.$emit('create', this.formBody)
      }
    },
    onReset() {
      this.formBody = JSON.parse(JSON.stringify(this.editItem))
    },
    handleCurrentChange(row) {
      if (this.tableOptions['isCanSelection']) {
        this.$emit('select-row', row)
      }
    }
  }
}
</script>

<style>
.table {
  height: 100%;
}
</style>
