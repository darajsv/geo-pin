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
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_BASE_URL}/plans`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({}),
          }
        );
        console.log(response);
        if (response.ok) {
          const data = await response.json();
          this.$emit('success', data.code);
        } else {
          console.error('Error sending POST request:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending POST request:', error);
      }
    },
  },
};
</script>

<style></style>
