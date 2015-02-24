var DEFAULT_ROUTE = 0;
var URL_BASE = 'http://156.35.95.67/dit/';

var template = document.querySelector('#template');
template.heading = 'Do It Together';
template.route = 0;

template.handleEventsResponse = function(e) {
  for (index in e.detail.response) {
    
    e.detail.response[index].time = new Date(e.detail.response[index].time).toUTCString();

    e.detail.response[index].attendAction = "attend";
    e.detail.response[index].attendText = "Attend";

    if (template.user.id == e.detail.response[index].userId) {
      e.detail.response[index].attendAction = "delete";
      e.detail.response[index].attendText = "Delete";
    } else {
      for (user in e.detail.response[index].attendees) {
        if (template.user.id == e.detail.response[index].attendees[user].userId) {
          e.detail.response[index].attendAction = "dropout";
          e.detail.response[index].attendText = "Drop out";
          break;
        }
      }
    }
  }
};

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

  var deleteEvent = function(eventId, userId) {
console.log('delete');
    template.$.ajax.url = URL_BASE + 'events/' + eventId;
    template.$.ajax.method = 'DELETE';
    template.$.ajax.contentType = 'application/json';
    template.$.ajax.go();

    userEvents(userId);
  }

  var attend = function(eventId, userId, attend) {
    if (attend) {
      template.$.ajax.url = URL_BASE + 'events/' + eventId + '/attendees';
      template.$.ajax.method = 'POST';
      template.$.ajax.body = JSON.stringify({
        userId: userId,
        eventId: parseInt(eventId),
        profileImage: template.user.profile
      });
    } else {
      template.$.ajax.url = URL_BASE + 'events/' + eventId + '/attendees/' + userId;
      template.$.ajax.method = 'DELETE';
    }
    template.$.ajax.contentType = 'application/json';
    template.$.ajax.go();

    attendEvents(userId);
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
    if (typeof eventId !== 'undefined') {
      infoPage.eventId = eventId;
      pages.selected = 1;
    }
  }

  var add = function() {
    pages.selected = 2;
  };

  var parsePage = function(route) {
    var fields = route.split('/');

    switch(fields[0]) {
      case 'events':
        if (fields.length == 5) {
          if (fields[4] == "delete") {
            deleteEvent(fields[1], fields[3]);
          } else {
            attend(fields[1], fields[3], fields[4] == "attend");
          }
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
    events();
  });
});
