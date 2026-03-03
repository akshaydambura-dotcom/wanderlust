if (listing.geometry && listing.geometry.coordinates) {

  const lat = listing.geometry.coordinates[1];
  const lng = listing.geometry.coordinates[0];

  const map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${listing.title}</b><br>${listing.location}`)
    .openPopup();

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

}