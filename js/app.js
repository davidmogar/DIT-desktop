var DEFAULT_ROUTE = 0;
var URL_BASE = 'http://156.35.95.67/dit/';

var template = document.querySelector('#template');
template.heading = 'Do It Together';
template.route = 0;

template.addEventListener('template-bound', function() {
  var pages = document.querySelector('#pages');
  var infoPage = document.querySelector('info-page');

  var events = function(id, name) {
    if (id && name) {
      template.category = id; 
      template.$.ajax.url = URL_BASE + 'categories/' + id + '/events';
      template.heading = name;
    } else {
      template.$.ajax.url = URL_BASE + 'events';
      template.heading = 'All Events';
    }

    template.$.ajax.method = 'GET';
    template.$.ajax.go();

    pages.selected = 0;
  }

  var attend = function(eventId, userId) {
    template.$.ajax.url = URL_BASE + 'events/' + eventId + '/attendees';
    template.$.ajax.contentType = 'application/json';
    template.$.ajax.method = 'POST';
    template.$.ajax.body = JSON.stringify({
      userId: userId,
      eventId: parseInt(eventId),
      profileImage: template.user.profile
    });
    template.$.ajax.go();
  }

  var attendEvents = function(userId) {
    template.$.ajax.url = URL_BASE + 'users/' + userId + '/attendees/events';
    template.$.ajax.method = 'GET';
    template.$.ajax.go();
    template.heading = 'Events you attend';
    pages.selected = 0;
  }

  var userEvents = function(userId) {
    template.$.ajax.url = URL_BASE + 'users/' + userId + '/events';
    template.$.ajax.method = 'GET';
    template.$.ajax.go();
    template.heading = 'Your Events';
    pages.selected = 0;
  }

  var info = function(eventId) {
    infoPage.eventId = eventId;
    pages.selected = 1; 
  }

  var add = function() {
    pages.selected = 2;
  };

  var parsePage = function(route) {
    var fields = route.split('/');

    switch(fields[0]) {
      case 'events':
        if (fields.length == 4) {
          attend(fields[1], fields[3]);
        } else {
          (fields.length == 3)? events(fields[1], fields[2]) : events();
        }
        break;
      case 'event':
        info(fields[1]);
        break;
      case 'add':
        add();
        break;
      case 'user':
        if (fields[2] == 'attend') attendEvents(fields[1]);
        else userEvents(fields[1]);
        break;
    }
  };

  document.addEventListener('change-route', function(e) {
    if (e.detail) {
      router.setRoute(e.detail);
    }
  });

  document.addEventListener('change-route-back', function() {
    history.back();
});

  document.addEventListener('director-route', function(e) {
    if (e.detail) {
      parsePage(e.detail);
      document.querySelector('body /deep/ #drawerPanel').togglePanel();
    }
  });

  document.addEventListener('user-connected', function(e) {
    template.user = e.detail;
  });
});
