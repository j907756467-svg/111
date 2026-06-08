App({
  // Touching the store on launch triggers first-run seeding so every page
  // sees a populated dataset immediately.
  onLaunch() {
    require('./utils/store.js').getTrips();
  },
});
