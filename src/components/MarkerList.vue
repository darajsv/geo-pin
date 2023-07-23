<!-- MarkerList.vue -->
<template>
  <div>
    <ul>
      <li v-for="(marker, index) in markers" :key="index">
        {{ marker.address }}
        {{ marker.phoneNumber }}
        {{ marker.openingHours }}
        {{ marker.placeId }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['markers']
}
</script>

<style scoped>
/* Add your custom styles here */
</style>
