<template>
  <div>
    <!-- Your other content -->
    <CreatePlanButton @success="handlePostSuccess"></CreatePlanButton>
    <CodeTextBox></CodeTextBox>
  </div>
</template>

<script>
import CreatePlanButton from '../components/CreatePlanButton.vue';
import CodeTextBox from '../components/CodeTextBox.vue';

export default {
  components: {
    CreatePlanButton,
    CodeTextBox,
  },
  methods: {
    handlePostSuccess(id) {
      this.$router.push({ path: '/maps', query: { id } });
    },
  },
};
</script>

<style>
/* Your styles */
</style>
