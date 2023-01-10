// Get URL for all earthquakes of at least 2.5 magnitude over the past 7 days
quakeurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"

// Get the GeoJSON data from the URL
d3.json(quakeurl).then(function (data) {
    //Send the data.features to a function that will put them on a map and handle pop-up info
    quakeFeatures(data.features);
});

//Create the quakeFeatures function
function quakeFeatures(recentQuakes){

    
    //Function that displays place, time, magnitude, and depth of each earthquake in a pop-up
    function createPopups(feature, layer) {
       layer.bindPopup(`<h4>Location: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`)
  
    };

    //Create a layer that contains the features array of the recentQuakes
    var quakeLayer = L.geoJSON(recentQuakes, {
        style: function(feature) {
            return {
                color: "black"
            };
        },
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: getRadius(feature),
                fillColor: getColor(feature),
                fillOpacity: 0.50
            });
        },
        onEachFeature: createPopups
    });

    //Function to determine circle color by depth of earthquake
    function getColor(feature){
       if (feature.geometry.coordinates[2] < 10){
        return "green";
       }
       else if (feature.geometry.coordinates[2] < 15){
        return "lightgreen";
       }
       else if (feature.geometry.coordinates[2] < 20){
        return "yellow";
       }
       else if (feature.geometry.coordinates[2] < 25){
        return "orange";
       }
       else if (feature.geometry.coordinates[2] < 30){
        return "lightred";
       }
       else {
        return "red";
       } 
    };

    //Function to determine size of the circle by magnitude
    function getRadius(feature){
        var circleRad = feature.properties.mag * 5
        return circleRad 
    };

    //Send the quakeLayer to the quakeMap function
    quakeMap(quakeLayer);
    
}

//Create the quakeMap function
function quakeMap(quakeLayer){

  // Base layers
  var satLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    subdomains:['mt0','mt1','mt2','mt3']
  })

  var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create baseMaps
  var baseMap = {
    "Satellite Map": satLayer,
    "Street Map": streetLayer,
    "Topographic Map": topLayer
  };

  //Create an overlay object to display the earthquakes
  var overlayObj = {
    Earthquakes: quakeLayer
  };

  // Create the map with the satLayer and quakeLayer
  var earthquakeMap = L.map("map", {
    center: [
        38.97202051971199, -95.23822400850696
    ],
    zoom: 4,
    layers: [satLayer, quakeLayer]
  });

  // Create layer control
  L.control.layers(baseMap, overlayObj, {
    collapsed: false
  }).addTo(earthquakeMap);

  // Create a legend to display depth colors
    var depthLegend = L.control({
    position: "bottomright"
  });
  
  // When the layer control is added, insert a div to the index.html with the class of "legend".
  depthLegend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    var depths = ["<10", "10-15", "15-20", "20-25", "25-30", ">30"];
    var colors = ["green", "lightgreen", "yellow", "orange", "pink", "red"];
    var labels = [];
    
    // Add the depths
    var legendInfo = "<h1>Earthquake Depths</h1>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + depths[0] + "</div>" +
            "<div class=\"max\">" + depths[depths.length - 1] + "</div>" +
        "</div>";

    div.innerHTML = legendInfo;

    depths.forEach(function(depth, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });
  
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };
  
  // Add the depth color legend to the map.
  depthLegend.addTo(earthquakeMap);
}