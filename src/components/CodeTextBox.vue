<template>
  <div>
    <input v-model="code" :maxlength="5" placeholder="Enter a 5-character code" />
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
        // Perform the GET request to your backend API here
        // Replace 'YOUR_BACKEND_API_ENDPOINT' with the actual endpoint of your backend API
        const response = await fetch(`${process.env.VUE_APP_BACKEND_BASE_URL}/plans/${this.code}`);

        if (response.ok) {
          // If the GET request was successful, parse the response data
          const responseData = await response.json();
      
          store.planData = responseData;
          // Redirect to the /maps route and pass the response data as query parameters
          this.$router.push({ path: '/maps', query: {id: responseData.code} });
        } else {
          // Handle the case when the GET request was not successful
          console.error('Error checking code:', response.statusText);
        }
      } catch (error) {
        console.error('Error checking code:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
