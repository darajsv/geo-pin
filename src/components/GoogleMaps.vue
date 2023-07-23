<template>
  <div>
    <div>
      <gmap-autocomplete @place_changed="setPlace"></gmap-autocomplete>
      <input type="text" v-model="customName" placeholder="Enter custom name" />
      <button @click="addMarker">Add Marker</button>
    </div>
    <GmapMap :center="center" :zoom="13" style="width: 100%; height: 400px">
      <div>
        <GmapMarker
          :key="index"
          v-for="(m, index) in markers"
          :position="m.position"
          @click="removeMarker(m)"
        ></GmapMarker>
      </div>
      <GmapPolyline
        :path="getPolylinePath()"
        :options="{ strokeColor: 'blue', strokeWeight: 5 }"
      ></GmapPolyline>
    </GmapMap>
    <SaveMarkersButton :markers="markers" :code="codeId" />
    <div>
      <label>
        <input type="checkbox" v-model="considerClosingTimes" />
        Consider closing times
      </label>
      <select v-model="selectedDay">
        <option value="0">Sunday</option>
        <option value="1">Monday</option>
        <option value="2">Tuesday</option>
        <option value="3">Wednesday</option>
        <option value="4">Thursday</option>
        <option value="5">Friday</option>
        <option value="6">Saturday</option>
      </select>
      <button @click="calculateRoute()">Recalculate Route</button>
    </div>
    <div v-if="routeData && routeData.routes.length > 0">
      <div v-for="(directions, index) in routeData.routes" :key="index">
        <div>Total Distance: {{ directions.legs[0].distance.text }}</div>
        <div v-if="directions.waypoint_order.length > 0">
          <h3>Visit Order:</h3>
          <ol>
            <li>{{ origin.customName || origin.address }}</li>
            <li v-for="(order, i) in directions.waypoint_order" :key="i">
              {{
                listWayPoint[order].customName || listWayPoint[order].address
              }}
            </li>
            <li>{{ destination.customName || destination.address }}</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SaveMarkersButton from './SaveMarkersButton.vue';
import polyline from '@mapbox/polyline';

import store from '../store.js';

export default {
  components: {
    SaveMarkersButton,
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      address: '',
      phoneNumber: '',
      openingHours: '',
      placeId: '',
      routeData: null,
      origin: null,
      destination: null,
      listWayPoint: [],
      customName: '',
      considerClosingTimes: false,
      selectedDay: 0,
      sortedMarkers: [],
    };
  },
  props: {
    codeId: {
      type: String,
      required: true,
    },
  },
  methods: {
    async calculateRoute() {
      if (this.markers.length < 2) {
        return; // Not enough markers to calculate a route
      }

      this.sortedMarkers = [...this.markers];
      if (this.considerClosingTimes) {
        this.sortedMarkers.sort((a, b) => {
          const aClosingTime =
            a.openingHours[this.selectedDay]?.close?.time || '2400';
          const bClosingTime =
            b.openingHours[this.selectedDay]?.close?.time || '2400';
          return aClosingTime - bClosingTime;
        });
      }

      const [origin, destination] = this.getFurthestMarkers();
      this.origin = origin;
      this.destination = destination;
      const waypoints = this.markers
        .filter((marker) => marker !== origin && marker !== destination)
        .map((marker) => {
          return { lat: marker.position.lat, lng: marker.position.lng };
        });
      this.listWayPoint = this.markers.filter(
        (marker) => marker !== origin && marker !== destination
      );

      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_BASE_URL}/routes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: { lat: origin.position.lat, lng: origin.position.lng },
            destination: {
              lat: destination.position.lat,
              lng: destination.position.lng,
            },
            waypoints,
            mode: 'driving',
          }),
        }
      );

      if (response.ok) {
        const route = await response.json();
        const decodedPolyline = polyline.decode(
          route.routes[0].overview_polyline.points
        );
        route.routes[0].overview_polyline = decodedPolyline.map(
          ([lat, lng]) => ({ lat, lng })
        );
        this.routeData = route;
        if (this.considerClosingTimes) {
          this.listWayPoint.sort((a, b) => {
            const indexA = this.routeData.routes[0].waypoint_order.indexOf(
              this.markers.indexOf(a)
            );
            const indexB = this.routeData.routes[0].waypoint_order.indexOf(
              this.markers.indexOf(b)
            );
            return indexA - indexB;
          });
          const bestRoute = [
            this.origin,
            ...this.listWayPoint,
            this.destination,
          ];

          // Now we create the points array by comparing the bestRoute and sortedMarkers order
          let points = bestRoute.map((marker) => {
            // Get the indices in both arrays
            const sortedIndex = this.sortedMarkers.indexOf(marker);
            const bestRouteIndex = bestRoute.indexOf(marker);

            // Calculate the points (the lower the index, the more the points)
            return {
              marker,
              points:
                this.markers.length -
                sortedIndex +
                (this.markers.length - bestRouteIndex),
            };
          });
          points.sort((a, b) => b.points - a.points);

          // Now we have the points array sorted by points, you can map it back to an array of markers if needed
          this.markers = points.map((point) => point.marker);
        }
      }
    },
    async removeMarker(marker) {
      const index = this.markers.indexOf(marker);
      if (index !== -1) {
        this.markers.splice(index, 1);
        if (this.markers.length >= 2) {
          await this.calculateRoute();
        } else {
          this.routeData = null; // clear the route if there are less than 2 markers
        }
      }
    },
    setPlace(place) {
      this.center = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      this.address = place.formatted_address;
      this.phoneNumber = place.formatted_phone_number;
      this.placeId = place.place_id;
      this.openingHours = place.opening_hours.periods;
    },
    async addMarker() {
      this.markers.push({
        position: this.center,
        address: this.address,
        phoneNumber: this.phoneNumber,
        openingHours: this.openingHours,
        placeId: this.placeId,
        customName: this.customName,
      });
      this.address = '';
      this.phoneNumber = '';
      this.placeId = '';
      this.openingHours = '';
      this.customName = '';

      await this.calculateRoute();
    },
    getPolylinePath() {
      if (this.routeData && this.routeData.routes && this.routeData.routes[0]) {
        // Extract latitude and longitude values from the route data

        return this.routeData.routes[0].overview_polyline;
      }
      return [];
    },
    getFurthestMarkers() {
      let furthestPair = [];
      let maxDistance = 0;

      // Calculate the distance between every pair of markers
      for (let i = 0; i < this.markers.length; i++) {
        for (let j = i + 1; j < this.markers.length; j++) {
          const distance = this.getDistance(
            this.markers[i].position,
            this.markers[j].position
          );

          // If the distance between this pair of markers is greater than the maxDistance
          // update maxDistance and furthestPair
          if (distance > maxDistance) {
            maxDistance = distance;
            furthestPair = [this.markers[i], this.markers[j]];
          }
        }
      }

      return furthestPair;
    },
    getDistance(position1, position2) {
      const rad = function (x) {
        return (x * Math.PI) / 180;
      };

      const R = 6378137; // Earth’s mean radius in meters
      const dLat = rad(position2.lat - position1.lat);
      const dLong = rad(position2.lng - position1.lng);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(position1.lat)) *
          Math.cos(rad(position2.lat)) *
          Math.sin(dLong / 2) *
          Math.sin(dLong / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance; // returns the distance in meters
    },
  },
  computed: {
    planData() {
      return store.planData ? store.planData.pins : [];
    },
  },
  async mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (error) => {
          console.log(
            'Unable to retrieve your location due to ',
            error.message
          );
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }

    if (this.planData && this.planData.length > 0) {
      this.markers = await Promise.all(
        this.planData.map(async (dataItem) => {
          const response = await fetch(
            `${process.env.VUE_APP_BACKEND_BASE_URL}/detail-location/${dataItem.placeId}`
          );
          const place = await response.json();
          return {
            position: {
              lat: Number(dataItem.latitude),
              lng: Number(dataItem.longitude),
            },
            address: place.result.formatted_address,
            phoneNumber: place.result.formatted_phone_number,
            openingHours: place.result.opening_hours?.periods || [], // handle case where opening hours might not be available
            placeId: place.result.place_id,
            customName: dataItem.customName,
          };
        })
      );
      console.log(this.markers[0].openingHours);
      await this.calculateRoute();
    }
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
