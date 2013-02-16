var story;
(function() {
  var Template = function(uri) {
    this.uri = uri;
    this.getTemplate();
  };

  Template.prototype = {
    render: function (context, callback) {
      if (this.template) {
        callback(this.template(context));
      } else {
        // In case our template is still loading
        this.getTemplate(function() {
          callback(this.template(context));
        });
      }
    },
    getTemplate: function (callback) {
      var proto = this;
      $.ajax({
        'url': this.uri,
        'cache': true,
        'success': function (payload) {
          proto.template = Handlebars.compile(payload);
          if (callback)
            callback();
        }
      });
    }
  };

  storyTemplate = new Template('story.handlebars');
  $.getJSON('stories.json', function(stories) {
    stories.forEach(function (story) {
      story.time_string = moment.unix(story.time).fromNow();
      storyTemplate.render(story, function(html) {
        $('#statuses').append($(html));
      });
      if (story.coordinates) {
        create_point(story.coordinates[1], story.coordinates[0]);
      }
    });

    // Pan to the first story that has a geo location
    for (var i = 0; i < stories.length; i++) {
      if (stories[i].coordinates) {
        var coordinates = stories[i].coordinates;
        map.panTo(new google.maps.LatLng(coordinates[1], coordinates[0]));
        break;
      }
    }

    // Add an event handler to add/remove selected class
    $('#statuses .status_update').click(function() {
      $('#statuses .status_update').removeClass('selected');
      $(this).addClass('selected');
    });
  });
})();
