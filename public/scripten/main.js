var story_data = {};

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

  var panTo = function(coordinates) {
    map.panTo(new google.maps.LatLng(coordinates[1], coordinates[0]));
  };

  storyTemplate = new Template('story.handlebars');
  storyNoPicturesTemplate = new Template('story_no_pictures.handlebars');

  $.getJSON('stories.json', function(stories) {
    stories.forEach(function (story) {
      story_data[story.id] = story;

      story.time_string = moment.unix(story.time).fromNow();

      var insert_html = function(html) {
        $('#statuses').append($(html));
      };
      // Handlebars doesnt like template logic. (This is dumb.)
      if (story.image)
        storyTemplate.render(story, insert_html);
      else
        storyNoPicturesTemplate.render(story, insert_html);


      if (story.coordinates) {
        create_point(story.coordinates[1], story.coordinates[0]);
      }
    });

    // Pan to the first story that has a geo location
    for (var i = 0; i < stories.length; i++) {
      if (stories[i].coordinates) {
        panTo(stories[i].coordinates);
        break;
      }
    }

    // Add an event handler to add/remove selected class
    $('#statuses .status_update').click(function() {
      $('#statuses .status_update').removeClass('selected');
      $(this).addClass('selected');
      var coordinates = story_data[this.getAttribute('data-story-id')].coordinates;
      if (coordinates)
        panTo(coordinates);
    });
  });
})();
