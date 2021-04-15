<template>
  <el-table :data="transferData" style="width: 100%" :show-header="false">
    <el-table-column label="key" prop="key" min-width="20%">
      <template slot-scope="scope">
        <b>{{ $t('ORDER.'+scope.row.key) }}</b>
      </template>
    </el-table-column>
    <el-table-column label="value" prop="value">
      <template slot-scope="scope">
        <template v-if="Array.isArray(scope.row.value)&&scope.row.value.length>0">
          <el-table :data="scope.row.value">
            <el-table-column v-for="item in Object.keys(scope.row.value[0])" :key="item" :label="$t('ORDER.'+item)" :prop="item">
              <template slot-scope="innerScope">
                <template v-if="typeof innerScope.row[item] === 'object' && innerScope.row[item]">
                  {{ (formatFunc) ? formatFunc(item, innerScope.row[item]) : innerScope.row[item] }}
                  <!--<KeyValueView :data="scope.row.value" />-->
                </template>
                <template v-else>
                  {{ innerScope.row[item] }}
                </template>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-else-if="typeof scope.row.value === 'object'">
          {{ scope.row.value.name }}
          <!--<KeyValueView :data="scope.row.value" />-->
        </template>
        <template v-else>{{ scope.row.value }}</template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'KeyValueView',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    formatFunc: {
      type: Function,
      default: () => ([])
    },
    translateKey: {
      type: String,
      default: null
    }
  },
  computed: {
    transferData() {
      const tableResult = []
      Object.keys(this.data).forEach((item) => {
        tableResult.push({ key: item, value: this.data[item] })
      })
      return tableResult
    }
  },
  mounted() {
    console.log(this.transferData)
  }
}
</script>

<style scoped>

</style>
