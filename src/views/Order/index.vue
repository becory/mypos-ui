<template>
  <div class="app-container">
    <splitpanes ref="mainSplit">
      <pane :size="splitSize[0]">
        <splitpanes horizontal class="orderList">
          <pane :size="splitOrder[0]">
            <el-row type="flex" class="customerOrder">
              <el-card class="split-container order">
                <template slot="header">
                  <el-row>
                    <el-col :span="10">
                      <el-select
                        v-model="order.customer"
                        filterable
                        remote
                        reserve-keyword
                        :remote-method="searchCustomer"
                        :loading="loadingCustomer"
                        value-key="id"
                      >
                        <el-option
                          v-for="item in customerOptions"
                          :key="item.id"
                          :label="item.name+' - ' +item.phone"
                          :value="item.id"
                        />
                      </el-select>
                    </el-col>
                    <el-col :span="3">
                      <el-input v-model="order.desk" placeholder="桌號" />
                    </el-col>
                    <el-col :span="5">
                      <el-select v-model="order.orderFrom">
                        <el-option value="C" label="顧客自選" />
                        <el-option value="S" label="店家" />
                        <el-option value="F" label="FoodPanda" />
                        <el-option value="U" label="UberEats" />
                      </el-select>
                    </el-col>
                    <el-col :span="6" class="align-right">
                      <el-button
                        v-touch:tap="toggleCalculator()"
                        icon="fas el-icon-fa-calculator"
                        type="primary"
                      />
                    </el-col>
                  </el-row>
                </template>
                <div class="order-card">
                  <el-alert type="info">
                    久按項目修改詳細資料
                  </el-alert>
                  <el-row
                    v-for="(menuItem,idx) in order.orderDetails"
                    :key="idx"
                    v-touch:tap="()=>onSelectRow(idx, menuItem)"
                    v-touch:longtap="()=>onSelectRowEdit(idx, menuItem)"
                    class="orderDetail"
                    :gutter="10"
                    :class="{selectRow: selectRow['index']===idx}"
                  >
                    <el-col :span="4" class="count align-right">
                      <span v-if="menuItem.count">{{ menuItem.count }}</span>
                    </el-col>
                    <el-col :span="15">
                      <el-row>
                        <el-col>
                          <el-tag v-if="menuItem.cook" :type="menuItem.cook.className" size="large" effect="dark">
                            {{ menuItem.cook.label }}
                          </el-tag>
                          <b>{{ menuItem.menuItem.name }}</b>
                          <div class="align-right">${{ Math.round(menuItem.menuItem.price) }}</div>
                        </el-col>
                        <el-col v-if="menuItem.menuItem.menuSet">
                          <el-tag v-for="(subItem, index) in menuItem.menuItem.menuSet" :key="index">
                            {{ subItem.name }}
                          </el-tag>
                        </el-col>
                        <el-col v-if="menuItem.remark">
                          **{{ menuItem.remark }}
                        </el-col>
                      </el-row>
                    </el-col>
                    <el-col :span="4" class="count align-right">
                      <el-button type="danger" icon="fas el-icon-fa-trash-alt" @click="removeOrderItem(idx)" />
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </el-row>
          </pane>
          <pane :size="splitOrder[1]">
            <el-row class="align-right">{{ order.orderDetails.length }}項，{{ totalCount }}份</el-row>
            <Keyboard @clickKeyboard="onKeyboard" />
          </pane>
        </splitpanes>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-button v-touch:tap="()=>onSave()" type="primary" icon="fas el-icon-fa-save">暫存</el-button>
          </el-col>
          <el-col :span="17">
            <DragButton :total="tempTotal(order.orderDetails)" @submit="onCheckOut" />
          </el-col>
        </el-row>
      </pane>
      <pane :size="splitSize[1]">
        <el-row type="flex" class="menu-container">
          <el-card class="menu-container">
            <el-tabs
              v-model="tabPanel"
              v-touch:swipe.left="onSwipe()"
              v-touch:swipe.right="onSwipe()"
              class="menu-container"
            >
              <template v-for="(menu,idx) in menuList">
                <el-tab-pane
                  :key="menu.id"
                  :label="menu.name"
                  :name="idx.toString()"
                >
                  <el-alert type="info">
                    滑動可翻頁
                  </el-alert>
                  <el-row :gutter="20" class="menu">
                    <template v-if="filterMenuItem(menu.id).length>0">
                      <el-col v-for="(menuItem, index) in filterMenuItem(menu.id)" :key="index" :span="6">
                        <el-card
                          v-touch:tap="addOrderItem(menuItem)"
                          :body-style="{ padding: '0px' }"
                          class="item-card"
                        >
                          <el-image
                            style="width:100%; height: 100%;"
                            fit="cover"
                            :src="getImageUrl(menuItem.image)"
                            class="image"
                          />
                          <div class="bottom">
                            <span>{{ menuItem.name }}</span>
                          </div>
                        </el-card>
                      </el-col>
                    </template>
                    <template v-else>
                      <el-alert type="warning">
                        <h1>沒有產品</h1>
                      </el-alert>
                    </template>
                  </el-row>
                </el-tab-pane>
              </template>
            </el-tabs>
          </el-card>
        </el-row>
      </pane>
    </splitpanes>
    <el-drawer
      :title="(selectRow['row'])?'No.'+(selectRow['index']+1)+' - '+selectRow['row']['menuItem']['name']: null"
      :visible.sync="editItemDrawer"
      direction="rtl"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <el-form v-if="order['orderDetails'][selectRow['index']]">
        <el-form-item label="烹調方式" label-width="80px">
          <el-select v-model="order['orderDetails'][selectRow['index']]['cook']" value-key="id">
            <el-option v-for="(item,idx) in cookOptions" :key="idx" :value="item" :label="item.label" />
          </el-select>
          <el-button v-touch:tap="()=>getCookSelection()" icon="fas el-icon-fa-sync-alt" />
        </el-form-item>
        <el-form-item label="備註" label-width="80px">
          <el-input v-model="order['orderDetails'][selectRow['index']]['remark']" />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import {
  deleteOrder,
  getLabelList,
  postOrder,
  putOrder,
  getUnitList,
  getMenuList,
  getCustomerList,
  getMenuItemList,
  getCookList,
  getOrderEdit
} from '@/api/api'
import { Splitpanes, Pane } from 'splitpanes'
import { notify } from '@/utils/notify'
import Keyboard from '@/components/Keyboard'
import DragButton from '@/components/DragButton'

export default {
  name: 'Menu',
  components: { DragButton, Keyboard, Splitpanes, Pane },
  data() {
    return {
      splitSize: [30, 70],
      splitOrder: [95, 5],
      tabPanel: 0,
      menuList: [],
      menuItemList: [],
      order: { customer: 1, orderDetails: [], orderFrom: 'S' },
      selectRow: {},
      keyboardValue: '',
      editItemDrawer: false,
      cookOptions: [],
      customerOptions: [],
      loadingCustomer: false
    }
  },
  computed: {
    totalCount() {
      return this.order.orderDetails.reduce((total, current) => (
        total + current.count
      ), 0)
    }
  },
  mounted() {
    this.getDataset()
    this.getMenuItem()
    this.getCookSelection()
    if (this.$route.params.id) {
      this.getOrderData()
    } else {
      this.initCustomer(1)
    }
  },
  methods: {
    initCustomer(id) {
      getCustomerList('?id=' + id)
        .then((res) => {
          this.customerOptions = res.data.result
        })
        .finally(() => {
          this.loadingCustomer = false
        })
    },
    getOrderData() {
      getOrderEdit(this.$route.params.id)
        .then((res) => {
          this.order = res.data
          this.order.customer = this.order.customer.id
          this.order.orderDetails.forEach((item) => {
            if (item['cook'] === '') {
              item['cook'] = null
            }
            if (!item['remark']) {
              item['remark'] = ''
            }
            delete item['transactionItem']
            delete item['transactionCost']
          })
          this.initCustomer(this.order.customer)
          this.edit = true
        })
        .catch(() => {
          notify('error', '錯誤', '取得資料失敗')
          this.$router.push({ name: 'Order' })
        })
    },
    getDataset() {
      getMenuList('?visible=true')
        .then((res) => {
          this.menuList = res.data.result
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    getMenuItem() {
      getMenuItemList('')
        .then((res) => {
          this.menuItemList = res.data.result
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
        })
    },
    filterMenuItem(menu) {
      return this.menuItemList.filter((item) => (item.menu.id === menu))
    },
    getCookSelection() {
      getCookList('')
        .then((res) => {
          this.cookOptions = res.data.result
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getCustomerSelection() {
      return getCustomerList('?selection=name')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
        })
    },
    getMenuSelection() {
      return getMenuList('?selection=name&children=menuID')
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          notify('error', 'Error', e, false)
          return Promise.reject()
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
    deleteDataset(row) {
      deleteOrder(row.id)
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
      postOrder(data)
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
      putOrder(row.id, row.data)
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
    onSelectRow(index, row) {
      this.selectRow = { index: index, row: row }
      this.keyboardValue = ''
      this.checkOrderItem()
    },
    onSelectRowEdit(index, row) {
      this.selectRow = { index: index, row: row }
      this.editItemDrawer = true
      this.keyboardValue = ''
      this.checkOrderItem()
    },
    cleanSelectRow() {
      this.$set(this.$data, 'selectRow', {})
      this.keyboardValue = ''
      this.checkOrderItem()
    },
    addOrderItem(menuItem) {
      const _this = this
      return function() {
        _this.cleanSelectRow()
        const result = { count: 1, menuItem: menuItem, cook: null, remark: '' }
        const same = _this.order.orderDetails.findIndex((item) => {
          return JSON.stringify(item['menuItem']) === JSON.stringify(result['menuItem']) && item['remark'] === result['remark'] && item['cook'] === result['cook']
        })
        if (same >= 0) {
          _this.$set(_this.order.orderDetails[same], 'count', _this.order.orderDetails[same]['count'] + 1)
        } else {
          _this.order.orderDetails.push(result)
        }
        _this.checkOrderItem()
      }
    },
    checkOrderItem() {
      this.order.orderDetails.map((item) => {
        if (item['count'] === 0 || !item['count']) {
          item['count'] = 1
        }
        return item
      })
    },
    editSelectRow(menuItem) {
      const index = this.order.orderDetails.findIndex((item) => (JSON.stringify(item) === JSON.stringify(this.selectRow['row'])))
      if (index >= 0) {
        this.$set(this.order.orderDetails, index, Object.assign(this.order.orderDetails[index], menuItem))
        this.$set(this.selectRow, 'row', Object.assign(this.selectRow['row'], menuItem))
      }
    },
    removeOrderItem(index) {
      if (index >= 0) {
        this.order.orderDetails.splice(index, 1)
      }
      this.cleanSelectRow()
    },
    onKeyboard(item) {
      if (Object.keys(this.selectRow).length > 0) {
        if (item === 'C') {
          this.keyboardValue = ''
          this.editSelectRow({ count: 1 })
        } else {
          this.keyboardValue += item.toString()
          this.editSelectRow({ count: parseInt(this.keyboardValue) })
        }
        this.checkOrderItem()
      }
    },
    onSwipe() {
      const _this = this
      return function(direction, event) {
        console.log(direction, event)
        const int = parseInt(_this.tabPanel)
        let index
        if (direction === 'right') {
          index = int + 1
        } else {
          index = int - 1
        }
        if (_this.menuList.length - 1 < index) {
          _this.tabPanel = '0'
        } else if (index < 0) {
          _this.tabPanel = (_this.menuList.length - 1).toString()
        } else {
          _this.tabPanel = index.toString()
        }
      }
    },
    toggleCalculator() {
      const _this = this
      return function() {
        if (_this.splitOrder[1] < 40) {
          _this.splitOrder = [55, 45]
        } else {
          _this.splitOrder = [93, 7]
        }
      }
    },
    apiOrder(data) {
      if (this.edit) {
        return putOrder(this.$route.params.id, data)
      }
      return postOrder(data)
    },
    onSave() {
      const order = JSON.parse(JSON.stringify(this.order))
      order['checkOut'] = false
      this.apiOrder(this.order)
        .then(() => {
          notify('success', '儲存成功，尚未結帳', '訂單已儲存')
          this.order = { customer: 1, orderDetails: [], orderFrom: 'S' }
          if (this.edit) {
            this.$router.push({ name: 'Dashboard' })
          }
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    onCheckOut() {
      const order = JSON.parse(JSON.stringify(this.order))
      console.log(order)
      order['checkOut'] = true
      this.apiOrder(order)
        .then(() => {
          notify('success', '結帳成功', '訂單已儲存')
          this.order = { customer: 1, orderDetails: [], orderFrom: 'S' }
          if (this.edit) {
            this.$router.push({ name: 'Dashboard' })
          }
        })
        .catch((e) => {
          if (e.response) {
            return notify('error', 'Error', e.response.data, false)
          }
          return notify('error', 'Error', e, false)
        })
    },
    searchCustomer(query) {
      if (query !== '') {
        this.loadingCustomer = true
        getCustomerList('?search=' + query)
          .then((res) => {
            this.customerOptions = res.data.result
          })
          .finally(() => {
            this.loadingCustomer = false
          })
      } else {
        this.customerOptions = []
      }
    },
    tempTotal(menuItem) {
      if (menuItem.length <= 0) return 0
      return menuItem.reduce((total, current) => (current.count * current.menuItem.price + total), 0)
    },
    getImageUrl(image) {
      if (!image) {
        return image
      }
      return process.env.VUE_APP_Media + image
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~splitpanes/dist/splitpanes.css';
@import "src/styles/element-variables.scss";

.app-container {
  position: relative;
  height: 100%;
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
  left: -20px;
  right: -20px;
  height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -20px;
  bottom: -20px;
  width: 100%;
}

.order {
  .el-card__header {
    padding: 0;
  }
}

.menu-container {
  width: 100%;
  height: 100%;

  .el-card__body {
    width: 100%;
    height: 100%;
  }
}

.menu{
  .el-col{
    padding-bottom: 10px;
  }
}

.item-card {
  position: relative;
  min-height: 5em;
  .bottom {
    position: absolute;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    font-weight: bolder;
    font-size: 16pt;
    font-size: 2vw;
    padding: 14px;
  }
}

.customerOrder {
  height: 100%;

  .el-card__body {
    height: 85%;
    overflow-y: auto;
    overflow-x: hidden;

    .selectRow {
      background-color: $--color-primary-light-7;
    }

    .order-card {
      margin-top: 2em;
      min-height: 100%;
      width: 100%;

      &:first-child {
        margin-top: 0;
      }

      .number {
        font-size: 2em;
        font-weight: bolder;
        border: 2px #000000 solid;
        padding: 0 10px;
      }

      .orderDetail {
        border-bottom: 2px #000000 solid;
        padding: 10px;

        .count {
          font-size: 2em;
          font-weight: bolder;
        }
      }
    }
  }
}

//.checkOut {
//  width: 100%
//}

.orderList {
  height: calc(100% - 40px);
}

.align-right {
  text-align: right;
}
</style>
