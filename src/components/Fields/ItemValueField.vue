<template>
  <div>
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
              v-model="scope.row[options['combineField']]"
              :options="selectionOptions"
              style="width:50%;"
              filterable
              clearable
              @change="handlerChange(scope.row, $event)"
            />
            <el-input v-model="scope.row[options['value']]" type="number" style="width:50%;">
              <span v-if="scope.row[options['append']]" slot="append">{{ scope.row[options['append']] }}</span>
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
    <el-button icon="fas el-icon-fa-plus-circle" type="success" @click="onAdd" />
    <el-button icon="fas el-icon-fa-sync-alt" @click="getSelectionOptions" />
  </div>
</template>

<script>

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
    },
    dataset: {
      type: Function,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      data: [],
      selectionOptions: []
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
          if (!item.hasOwnProperty(this.options['combineField'])) {
            item[this.options['combineField']] = [item[this.options['master']], item[this.options['child']]]
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
      if (!item.hasOwnProperty(this.options['combineField'])) {
        item[this.options['combineField']] = [item[this.options['master']], item[this.options['child']]]
      }
      return item
    })
    this.getSelectionOptions()
  },
  methods: {
    getSelectionOptions() {
      this.dataset().then((res) => (this.selectionOptions = res))
    },
    onAdd() {
      const result = {
        [this.options['master']]: null,
        [this.options['child']]: null,
        [this.options['combineField']]: null,
        [this.options['value']]: null

      }
      if (this.options['append']) {
        result[this.options['append']] = null
      }
      this.data.push(result)
    },
    onDelete(index) {
      this.data.splice(index, 1)
    },
    handlerChange(row, val) {
      if (val && val[0] && val[1]) {
        row[this.options['master']] = val[0]
        row[this.options['child']] = val[1]
        const getLabel = this.selectionOptions.find((item) => (item.value === val[0]))
        if (getLabel.children) {
          const getMaterial = getLabel.children.find((item) => (item.value === val[1]))
          if (this.options['append']) {
            row[this.options['append']] = getMaterial[this.options['append']]
          }
        }
      } else {
        row[this.options['append']] = null
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
