<template>
  <div>
    <input
      v-model="code"
      :maxlength="5"
      placeholder="Enter a 5-character code"
    />
    <button @click="checkCode">Check Code</button>
  </div>
</template>

<script>
import store from '../store.js';
export default {
  data() {
    return {
      code: '',
    };
  },
  methods: {
    async checkCode() {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_BASE_URL}/plans/${this.code}`
        );

        if (response.ok) {
          const responseData = await response.json();

          store.planData = responseData;

          this.$router.push({
            path: '/maps',
            query: { id: responseData.code },
          });
        } else {
          console.error('Error checking code:', response.statusText);
        }
      } catch (error) {
        console.error('Error checking code:', error);
      }
    },
  },
};
</script>

<style scoped></style>
