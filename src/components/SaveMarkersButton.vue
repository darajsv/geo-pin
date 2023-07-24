<template>
  <button @click="saveMarkers">Save Markers</button>
</template>

<script>
export default {
  methods: {
    async saveMarkers() {
      try {
        const markers = this.markers.map((marker, index) => {
          return {
            latitude: marker.position.lat,
            longitude: marker.position.lng,
            placeId: marker.placeId,
            order: index,
            customName: marker.customName,
          };
        });
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_BASE_URL}/plans/${this.code}/pins`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(markers),
          }
        );

        if (response.status === 200) {
          console.log('Markers saved successfully!');
        } else {
          console.error('Failed to save markers.');
        }
      } catch (error) {
        console.error('Error saving markers:', error);
      }
    },
  },

  props: {
    markers: {
      type: Array,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
};
</script>
