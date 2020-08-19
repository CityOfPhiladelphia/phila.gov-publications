<template>
  <div id="app">
   
    <!-- <Publications /> -->
    <Publications2 />
  </div>
</template>

<script>
// import Publications from './components/Publications.vue'
import Publications2 from './components/Publications2.vue'


export default {
  name: 'App',
  components: {
    // Publications,
    Publications2
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
