<template>
  <div>
    <button @click="sendPostRequest">Send POST Request</button>
  </div>
</template>

<script>
export default {
  methods: {
    async sendPostRequest() {
      try {
        // Perform the POST request to your backend API here
        // Replace 'YOUR_BACKEND_API_ENDPOINT' with the actual endpoint of your backend API
        const response = await fetch(`${process.env.VUE_APP_BACKEND_BASE_URL}/plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {}
        });

        if (response.ok) {
          // Emit a success event to notify the parent component
          const data = await response.json();
          this.$emit('success', data.code);
        } else {
          // Handle the case when the POST request was not successful
          console.error('Error sending POST request:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending POST request:', error);
      }
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>
