<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
// Import Font Awesome 5 Free
$fa-css-prefix: 'el-icon-fa';
$fa-font-path: '~@fortawesome/fontawesome-free/webfonts';

@import '~@fortawesome/fontawesome-free/scss/fontawesome.scss';
@import '~@fortawesome/fontawesome-free/scss/regular.scss';
@import '~@fortawesome/fontawesome-free/scss/solid.scss';
@import '~@fortawesome/fontawesome-free/scss/brands.scss';
@import 'styles/const.scss';

// Override Element UI's icon font
.fas {
  font-family: 'Font Awesome 5 Free' !important;
}

.fab {
  font-family: 'Font Awesome 5 Brands' !important;
}

button {
    touch-action: manipulation;
}
</style>
