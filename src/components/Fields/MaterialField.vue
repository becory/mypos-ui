<template>
  <div>
    <el-button icon="fas el-icon-fa-plus-circle" type="success" @click="onAdd" />
    <el-table v-if="data.length>0" :data="data" :show-header="false">
      <el-table-column width="40">
        <template slot-scope="scope">
          <b>{{ scope.$index + 1 }}</b>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <el-form-item>
            <el-cascader
              v-model="scope.row.materialValue"
              :options="selectionOptions.label"
              style="width:50%;"
              filterable
              clearable
              @change="handlerChange(scope.row, $event)"
            />
            <el-input v-model="scope.row.count" type="number" style="width:50%;">
              <span slot="append">{{ scope.row.unit }}</span>
            </el-input>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column width="100">
        <template slot-scope="scope">
          <el-button type="danger" icon="fas el-icon-fa-trash-alt" @click="onDelete(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getLabelList, getMaterialList } from '@/api/api'
import { notify } from '@/utils/notify'

export default {
  name: 'ListField',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      data: [],
      selectionOptions: { label: [], material: [] }
    }
  },
  watch: {
    data(newVal) {
      this.$emit('input', newVal)
    },
    value: {
      deep: true,
      handler(newVal) {
        this.data = newVal.map((item) => {
          // eslint-disable-next-line no-prototype-builtins
          if (!item.hasOwnProperty('materialValue')) {
            item['materialValue'] = [item['label'], item['material']]
          }
          return item
        })
        this.data = newVal
      }
    }
  },
  mounted() {
    this.data = this.value.map((item) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!item.hasOwnProperty('materialValue')) {
        item['materialValue'] = [item['label'], item['material']]
      }
      return item
    })
    this.getMaterialSelection().then((res) => (this.$set(this.selectionOptions, 'material', res)))
    this.getLabelSelection().then((res) => (this.$set(this.selectionOptions, 'label', res)))
  },
  methods: {
    onAdd() {
      this.data.push({ 'label': null, 'material': null, materialValue: null, 'count': null, 'unit': null })
    },
    onDelete(index) {
      this.data.splice(index, 1)
    },
    getLabelSelection() {
      return getLabelList('?selection=name&children=materials')
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
    handlerChange(row, val) {
      if (val && val[0] && val[1]) {
        row.label = val[0]
        row.material = val[1]
        const getLabel = this.selectionOptions.label.find((item) => (item.value === val[0]))
        if (getLabel.children) {
          const getMaterial = getLabel.children.find((item) => (item.value === val[1]))
          if (getMaterial) {
            row.unit = getMaterial.unit
          }
        }
      } else {
        row.unit = null
      }
    }
  }
}
</script>

<style>
.el-form-item__content {
  width: 100%;
}
</style>
