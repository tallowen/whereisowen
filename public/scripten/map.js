var map;
var create_point;
(function(){
  function initialize() {
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(47.6709322, -122.3098328),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
  }

  create_point = function(lat, lng, text) {
    var position = new google.maps.LatLng(lat, lng);
    return new google.maps.Marker({
      position: position,
      map: map,
      text: text
    });
  };
  google.maps.event.addDomListener(window, 'load', initialize);
})();