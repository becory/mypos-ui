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
      :key="reload"
      :data="data['result']"
      class="table"
      :highlight-current-row="tableOptions['isCanSelection']"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        v-for="(column,idx) in columnOptions"
        :key="idx"
        :prop="column.field"
        :label="column.label"
        :fixed="column.fixed"
      />
      <el-table-column label="操作" fixed="right" align="right">
        <template slot-scope="scope">
          <el-button type="info" size="small" icon="fas el-icon-fa-edit" @click="onEdit(scope.row)" />
          <el-button
            v-if="tableOptions['isCanUpload']"
            type="success"
            size="small"
            icon="fas el-icon-fa-image"
            @click="onUpload(scope.row)"
          />
          <el-button
            type="danger"
            size="small"
            icon="fas el-icon-fa-trash-alt"
            @click="onDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      ref="pager"
      :current-page="page"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="data['totalCount']"
      @size-change="handlePageSizeChange"
      @current-change="handlePageCurrentChange"
    />
    <el-dialog :visible.sync="createDialog" :title="mode">
      {{ formBody }}
      <el-form ref="form" :model="formBody" :rules="rules">
        <template v-for="(input,idx) in form">
          <!--          <template v-if="Object.keys(targetObject).indexOf(input['field'])<0">-->
          <el-form-item :key="idx" :label="input['label']" :prop="input['field']">
            <div
              :is="input['inputType']"
              v-model="formBody[input.field]"
              v-bind="input.options"
            >
              <template v-if="input['inputType']==='el-select'">
                <el-option
                  v-for="(item, i) in selectionOptions[input.field]"
                  :key="i"
                  :label="item.value +' - '+ item.label"
                  :value="item.value"
                />
              </template>
              <template v-else-if="input['inputType']==='el-radio-group'">
                <el-radio
                  v-for="(item, i) in input.dataset"
                  :key="i"
                  :label="item.value"
                >{{ item.label }}
                </el-radio>
              </template>
            </div>
            <el-button
              v-if="input.dataset&&input['inputType']==='el-select'"
              icon="fas el-icon-fa-sync"
              @click="getSelectionOptions(input.field, input.dataset)"
            />
          </el-form-item>
        </template>
        <!--        </template>-->
        <el-form-item>
          <el-button type="primary" @click="onSubmit">Submit</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="uploadModal" title="上傳">
      <el-form>
        <el-form-item label="上傳">
          <el-upload
            drag
            action=""
            :http-request="onUploadFile"
          />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { tip } from '@/utils/notify'
import MaterialField from '@/components/Fields/MaterialField'
import { serverBackend } from '@/api/api'
import { notify } from '@/utils/notify'

export default {
  name: 'Index',
  components: {
    MaterialField
  },
  props: {
    data: {
      type: [Object, Array],
      default: () => ({})
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
    },
    page: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 25
    },
    target: {
      type: Number,
      default: 0
    },
    targetObject: {
      type: Object,
      default: () => ({})
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentPage: 1,
      createDialog: false,
      formBody: {},
      selectionOptions: {},
      editID: null,
      editItem: {},
      editing: false,
      reload: Math.random() * 984568746,
      uploadModal: false
    }
  },
  computed: {
    mode() {
      if (this.editing) {
        return '編輯'
      }
      return '建立'
    },
    api() {
      return process.env.VUE_APP_API
    }
  },
  watch: {
    columnOptions: {
      deep: true,
      handler(val) {
        this.$nextTick(() => {
          this.reload = this.reload + 1
        })
      }
    }
  },
  mounted() {
    this.form.filter((item) => (item['dataset']))
      .forEach((item) => {
        if (typeof item.dataset === 'function') {
          this.getSelectionOptions(item.field, item.dataset)
        }
      })
  },
  methods: {
    getSelectionOptions(field, func) {
      (func)().then((res) => (this.$set(this.selectionOptions, field, res))).catch((e) => (tip('error', e)))
    },
    onCreate() {
      this.formBody = {}
      if (Object.keys(this.targetObject).length > 0) {
        const result = {}
        Object.keys(this.targetObject).forEach((item) => {
          result[item] = this.targetObject[item].id
        })
        this.formBody = Object.assign(this.formBody, result)
      }
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
      if (Object.keys(this.targetObject).length > 0) {
        const result = {}
        Object.keys(this.targetObject).forEach((item) => {
          result[item] = this.targetObject[item].id
        })
        this.formBody = Object.assign(this.formBody, result)
      }
      this.editItem = JSON.parse(JSON.stringify(row))
      this.editID = row.id
      this.editing = true
      this.createDialog = true
    },
    onUpload(row) {
      this.uploadModal = true
      this.editID = row.id
    },
    onUploadFile(request) {
      const form = new FormData()
      form.append('image', request.file)
      const instance = serverBackend
      instance.put(this.name + this.editID + '/Upload/', form, { headers: { 'Content-Disposition': 'attachment; filename=' + request.file.name }
      })
        .then((res) => {
          this.$emit('refresh')
          notify('success', '上傳成功', res.data)
        })
    },
    onDelete(row) {
      this.$confirm((this.tableOptions['deleteMessage']) ? this.tableOptions['deleteMessage'] : '確定刪除嗎？', '確定刪除？', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.editing) {
            this.$emit('edit', { id: this.editID, data: this.formBody })
          } else {
            this.$emit('create', this.formBody)
          }
        } else {
          return false
        }
      })
    },
    onReset() {
      this.formBody = JSON.parse(JSON.stringify(this.editItem))
    },
    handleCurrentChange(row) {
      if (this.tableOptions['isCanSelection']) {
        this.$emit('select-row', row)
      }
    },
    handlePageSizeChange(val) {
      this.$nextTick(() => {
        const newTotalPage = Math.ceil(this.data['totalCount'] / val)
        if (this.page > newTotalPage) {
          this.$emit('page-change', [this.target, newTotalPage])
          this.$emit('size-change', [this.target, val])
        } else {
          this.$emit('size-change', [this.target, val])
        }
      })
    },
    handlePageCurrentChange(val) {
      this.$nextTick(() => {
        this.$emit('page-change', [this.target, val])
      })
    }
  }
}
</script>

<style>
/*.table {*/
/*  height: 90%;*/
/*}*/
</style>
