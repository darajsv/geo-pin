<template>
  <div>
    <GoogleMaps :codeId="receivedId" />
    <div v-if="receivedId">
      <h1>Received ID: {{ receivedId }}</h1>
    </div>
  </div>
</template>

<script>
import GoogleMaps from '../components/GoogleMaps.vue';

import store from '../store.js';

export default {
  components: {
    GoogleMaps,
  },
  data() {
    return {
      receivedId: this.$route.query.id,
    };
  },
  computed: {
    data() {
      return store.planData ? store.planData : null;
    },
  },
};
</script>
