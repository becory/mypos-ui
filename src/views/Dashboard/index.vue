<template>
  <div class="scroll-container">
    <el-scrollbar vertical="true" :native="false" view-style="{width:100%; height:100%;}" class="app-container">
      <el-alert type="info">
        只顯示今天的訂單，拖曳改變訂單狀態，點一下訂單可以修改內容，或進行[暫存]/[結帳]
      </el-alert>
      <el-row class="row-container" type="flex">
        <el-col
          v-for="(status, index) in statusList"
          :key="status.id"
          v-loading="loading[index]"
          :span="8"
          class="col-container"
          :class="status.className"
        >
          <el-row :gutter="5" type="flex" justify="center" align="middle">
            <el-col :span="18">
              <h2><i :class="status.icon" /> {{ status.name }}</h2>
            </el-col>
            <el-col :span="6" class="align-right">
              <el-button icon="fas el-icon-fa-sync" @click="initOrderStatusDetail" />
            </el-col>
          </el-row>
          <draggable
            :list="status.children"
            class="list-group"
            :class="status.className"
            :draggable="'.item'"
            :empty-insert-threshold="500"
            ghost-class="ghost"
            group="dashboard"
            :move="checkMoveCondition"
            @change="onChangeOrder(status.id, $event)"
          >
            <el-card
              v-for="(item, idx) in status.children"
              :key="idx"
              class="item-card item"
              :class="{takeout:(item.desk>0)}"
            >
              <template slot="header">
                <el-row>
                  <el-col v-touch:tap="()=>toEditOrder(item.id)" :span="18">
                    <span class="number">{{ item.orderID }}</span> {{ item.customer.name }}
                  </el-col>
                  <el-col :span="6" class="align-right">
                    結帳
                    <el-switch v-model="item.checkOut" disabled />
                  </el-col>
                </el-row>
              </template>
              <el-row :gutter="10">
                <el-col :span="5" class="align-right">
                  桌號
                </el-col>
                <el-col :span="9">
                  <span class="desk"><b>{{ (item.desk === 0) ? '外帶' : item.desk }}</b></span>
                </el-col>
                <el-col :span="5" class="align-right">
                  訂單來源
                </el-col>
                <el-col :span="5">
                  {{ item.orderFrom }}
                </el-col>
              </el-row>
              <el-divider />
              <el-row v-for="(menuItem,menuIdx) in item.orderDetails" :key="menuIdx" class="orderDetail" :gutter="10">
                <el-col :span="4" class="count align-right">
                  {{ menuItem.count }}
                </el-col>
                <el-col :span="20">
                  <el-row>
                    <el-col>
                      <el-tag v-if="menuItem.cook" :type="menuItem.cook.className" size="large" effect="dark">
                        {{ menuItem.cook.label }}
                      </el-tag>
                      <b>{{ menuItem.transactionItem }}</b>
                      <div class="align-right">${{ Math.round(menuItem.transactionCost) }}</div>
                    </el-col>
                    <el-col v-if="menuItem.menuItem.menuSet">
                      <el-tag v-for="(subItem, subIdx) in menuItem.menuItem.menuSet" :key="subIdx">
                        {{ subItem.name }}
                      </el-tag>
                    </el-col>
                    <el-col v-if="menuItem.remark">
                      **{{ menuItem.remark }}
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row>
                <template v-if="item.checkOut">
                  <el-col :span="8">總計</el-col>
                  <el-col :span="16" class="align-right"><b>${{ item.checkOutTotal }}</b></el-col>
                </template>
                <template v-else>
                  <el-col :span="8">未結帳金額</el-col>
                  <el-col :span="16" class="align-right"><b>${{ tempTotal(item.orderDetails) }}</b></el-col>
                </template>
              </el-row>
            </el-card>
          </draggable>
        </el-col>
      </el-row>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import { getOrderDashboardList, getOrderStatusList, patchOrder } from '@/api/api'
import { notify } from '@/utils/notify'

export default {
  name: 'Dashboard',
  components: { draggable },
  data() {
    return {
      currentRole: 'adminDashboard',
      statusList: [],
      loading: []
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted() {
    this.getOrderStatus()
  },
  methods: {
    getOrderStatus() {
      getOrderStatusList('')
        .then((res) => {
          this.statusList = res.data.result
          this.initOrderStatusDetail()
        })
    },
    initOrderStatusDetail() {
      this.statusList.forEach((item, idx) => {
        this.getOrderStatusDetail(item.id, idx)
      })
    },
    getOrderStatusDetail(status, idx) {
      this.$set(this.loading, idx, true)
      getOrderDashboardList('?status=' + status)
        .then((res) => {
          const statusIndex = this.statusList.findIndex((item) => (item.id === status))
          this.$set(this.statusList[statusIndex], 'children', res.data.result)
        })
        .finally(() => {
          this.$set(this.loading, idx, false)
        })
    },
    checkMoveCondition(event) {
      const { to, from } = event
      const toObj = this.statusList.findIndex((item) => (item.className === to.className.split(' ')[to.className.split(' ').length - 1]))
      const fromObj = this.statusList.findIndex((item) => (item.className === from.className.split(' ')[from.className.split(' ').length - 1]))
      if (Math.abs(fromObj - toObj) > 1) {
        return false
      }
    },
    onChangeOrder(status_id, drag) {
      if (drag['added']) {
        const change = patchOrder(drag.added.element.id, { status: status_id })
          .then((res) => {
            this.initOrderStatusDetail()
            notify('success', '狀態變更', res.data.orderID + ' 訂單狀態變更成功', false)
            return Promise.resolve(true)
          })
          .catch((e) => {
            notify('error', 'Error', e, false)
            return Promise.reject(false)
          })
        return change.then((res) => (res))
      }
    },
    toEditOrder(id) {
      this.$router.push({ name: 'EditOrder', params: { id: id }})
    },
    tempTotal(menuItem) {
      if (menuItem.length <= 0) return 0
      return menuItem.reduce((total, current) => (current.count * current.transactionCost + total), 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/element-variables.scss";

.app-container {
  position: relative;
  height: 90vh;
}

.scroll-container {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.row-container, .list-group {
  width: 100%;
  min-height: 100%
}

.col-container {
  padding-bottom: 2em;
  padding-left: 2em;
  padding-right: 2em;
}

.item-card {
  margin-top: 2em;

  &:first-child {
    margin-top: 0;
  }

  .number {
    font-size: 2em;
    font-weight: bolder;
    border: 2px #000000 solid;
    padding: 0 10px;
  }

  .desk {
    font-size: 1.5em;
  }

  .orderDetail {
    border-bottom: 2px #000000 solid;
    margin-bottom: 1em;

    .count {
      font-size: 2em;
      font-weight: bolder;
    }
  }
}

.pending {
  background: $--color-danger-light;
}

.cooking {
  background: $--color-warning-light;
}

.finish {
  background: $--color-success-light;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.align-right {
  text-align: right;
}

.col-padding {
  padding-left: 1em
}

.takeout {
  background: mix($--color-white, $--color-primary-light-7, 50%);
}

</style>
