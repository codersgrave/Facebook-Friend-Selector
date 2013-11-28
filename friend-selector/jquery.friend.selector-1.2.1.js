/*!
 * Facebook Friend Selector
 * Copyright (c) 2013 Coders' Grave - http://codersgrave.com
 * Version: 1.2.1
 * Requires:
 *   jQuery v1.6.2 or above
 *   Facebook Integration - http://developers.facebook.com/docs/reference/javascript/
 */
;(function(window, document, $, undefined) {
  'use strict';

  var fsOptions = {},
  running = false, isShowSelectedActive = false,
  windowWidth = 0, windowHeight = 0, selected_friend_count = 1,
  search_text_base = '',

  content, wrap, overlay,
  fbDocUri = 'http://developers.facebook.com/docs/reference/javascript/',

  _start = function() {

    if ( FB === undefined ){
      alert('Facebook integration is not defined. View ' + fbDocUri);
      return false;
    }

    fsOptions = $.extend(true, {}, defaults, fsOptions);
    fsOptions.onPreStart();

    if ( fsOptions.max > 0 && fsOptions.max !== null ) {
      fsOptions.showSelectedCount = true;

      // if max. number selected, hide select all button
      fsOptions.showButtonSelectAll = false;
    }

    _dialogBox();
    fsOptions.onStart();

  },

  _close = function() {

    wrap.fadeOut(400, function(){
      content.empty();
      wrap.remove();
      _stopEvent();
      overlay.fadeOut(400, function(){
        overlay.remove();
      });
    });

    running = false;
    isShowSelectedActive = false;
    fsOptions.onClose();

  },

  _submit = function() {

    var selected_friends = [];
    $('input.fs-friends:checked').each(function(){
      selected_friends.push(parseInt($(this).val().split('-')[1], 10));
    });

    if ( fsOptions.facebookInvite === true ){
      
      var friends = selected_friends.join();

      FB.ui({
        method: 'apprequests',
        message: fsOptions.lang.facebookInviteMessage,
        to: friends
      },function(response){

        if ( response !== null ){
          fsOptions.onSubmit(selected_friends);

          if ( fsOptions.closeOnSubmit === true ) {
            _close();
          }
        }

      });
    }
    else{
      fsOptions.onSubmit(selected_friends);

      if ( fsOptions.closeOnSubmit === true ) {
        _close();
      }
    }

  },

  _dialogBox = function() {

    if (running === true) {
      return;
    }

    running = true;

    $('body').append(
      overlay = $('<div id="fs-overlay"></div>'),
      wrap = $('<div id="fs-dialog-box-wrap"></div>')
    );

    wrap.append('<div class="fs-dialog-box-bg" id="fs-dialog-box-bg-n"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-ne"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-e"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-se"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-s"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-sw"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-w"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-nw"></div>');
    wrap.append(
      content = $('<div id="fs-dialog-box-content"></div>')
    );

    var container = '<div id="fs-dialog" class="fs-color-'+fsOptions.color+'">' +
                      '<h2 id="fs-dialog-title"><span>'+fsOptions.lang.title+'</span></h2>' +

                      '<div id="fs-filter-box">' +
                        '<div id="fs-input-wrap">' +
                          '<input type="text" id="fs-input-text" title="'+fsOptions.lang.searchText+'" />' +

                          '<a href="javascript:{}" id="fs-reset">Reset</a>' +
                        '</div>' +
                      '</div>' +

                      '<div id="fs-user-list">' +
                        '<ul></ul>' +
                      '</div>' +

                      '<div id="fs-filters-buttons">' +
                        '<div id="fs-filters">' +
                          '<a href="javascript:{}" id="fs-show-selected"><span>'+fsOptions.lang.buttonShowSelected+'</span></a>' +
                        '</div>' +
      
                        '<div id="fs-dialog-buttons">' +
                          '<a href="javascript:{}" id="fs-submit-button" class="fs-button"><span>'+fsOptions.lang.buttonSubmit+'</span></a>' +
                          '<a href="javascript:{}" id="fs-cancel-button" class="fs-button"><span>'+fsOptions.lang.buttonCancel+'</span></a>' +
                        '</div>' +
                      '</div>' +
                    '</div>';


    content.html(container);
    _getFacebookFriend();
    _resize(true);
    _initEvent();
    _selectAll();

    $(window).resize(function(){
      _resize(false);
    });

  },

  _getFacebookFriend = function() {


    $('#fs-user-list').append('<div id="fs-loading"></div>');

    if ( fsOptions.addUserGroups && !fsOptions.facebookInvite ) {

      FB.api('/', 'POST', {
        batch: [
          { method: 'GET', relative_url: 'me/friends' },
          { method: 'GET', relative_url: 'me/groups' },
        ]
      }, function (response) {
        _parseFacebookFriends(response);
      });
      
    } else {
    
      FB.api('/me/friends', function(response){
        _parseFacebookFriends(response);
      }); 
    }

  },
  
  _parseFacebookFriends = function (response) {
    if ( response.error ){
      alert(fsOptions.lang.fbConnectError);
      _close();
      return false;
    }
    
    var facebook_friends = [];
    
    if ( fsOptions.addUserGroups && !fsOptions.facebookInvite ) {
      var facebook_friends = $.parseJSON(response[0].body).data;
      $.merge(facebook_friends, $.parseJSON(response[1].body).data);  
    } else {
      facebook_friends = response.data;
    }

    var max_friend_control = fsOptions.maxFriendsCount !== null && fsOptions.maxFriendsCount > 0;
    if ( fsOptions.showRandom === true || max_friend_control === true ){
      facebook_friends = _shuffleData(response.data);
    }

    for (var i = 0, k = 0; i < facebook_friends.length; i++) {
      if ( max_friend_control && fsOptions.maxFriendsCount <= k ){
        break;
      }

      if ($.inArray(parseInt(facebook_friends[i].id, 10), fsOptions.getStoredFriends) >= 0) {
        _setFacebookFriends(i, facebook_friends, true);
        k++;
      }
    }

    for (var j = 0; j < facebook_friends.length; j++) {

      if ( max_friend_control && fsOptions.maxFriendsCount <=  j + fsOptions.getStoredFriends.length){
        break;
      }

      if ($.inArray(parseInt(facebook_friends[j].id, 10), fsOptions.excludeIds) >= 0) {
        continue;
      }
      
      if ($.inArray(parseInt(facebook_friends[j].id, 10), fsOptions.getStoredFriends) <= -1) {
        _setFacebookFriends(j, facebook_friends, false);
      }

    }

    $('#fs-loading').remove();
  },

  _setFacebookFriends = function (k, v, predefined) {

    var item = $('<li/>');

    var link =  '<a class="fs-anchor" href="javascript://">' +
                  '<input class="fs-fullname" type="hidden" name="fullname[]" value="'+v[k].name.toLowerCase().replace(/\s/gi, "0")+'" />' +
                  '<input class="fs-friends" type="checkbox" name="friend[]" value="fs-'+v[k].id+'" />' +
                  '<img class="fs-thumb" src="https://graph.facebook.com/'+v[k].id+'/picture" />' +
                  '<span class="fs-name">' + _charLimit(v[k].name, 15) + '</span>' +
                '</a>';

    item.append(link);

    $('#fs-user-list ul').append(item);

    if (predefined) {
      _select(item);
    }

  },

  _initEvent = function() {
  
    wrap.delegate('#fs-cancel-button', 'click.fs', function(){
      _close();
    });
    
    wrap.delegate('#fs-submit-button', 'click.fs', function(){
      _submit();
    });
    
    
    $('#fs-dialog input').focus(function(){
      if ($(this).val() === $(this)[0].title){
        $(this).val('');
      }
    }).blur(function(){
      if ($(this).val() === ''){
        $(this).val($(this)[0].title);
      }
    }).blur();


    $('#fs-dialog input').keyup(function(){
      _find($(this));
    });


    wrap.delegate('#fs-reset', 'click.fs', function() {
      $('#fs-input-text').val('');
      _find($('#fs-dialog input'));
      $('#fs-input-text').blur();
    });


    wrap.delegate('#fs-user-list li', 'click.fs', function() {
      _select($(this));
    });
    
    $('#fs-show-selected').click(function(){
      _showSelected($(this));
    });

    $(document).keyup(function(e) {
      if (e.which === 27 && fsOptions.enableEscapeButton === true) {
        _close();
      }
    });


    if ( fsOptions.closeOverlayClick === true ) {
      overlay.css({'cursor' : 'pointer'});
      overlay.bind('click.fs', _close);
    }

  },

  _select = function(th) {
    var btn = th;

    if ( btn.hasClass('checked') ) {

      btn.removeClass('checked');
      btn.find('input.fs-friends').attr('checked', false);

      selected_friend_count--;

      if (selected_friend_count - 1 !== $('#fs-user-list li').length) {
        $('#fs-select-all').text(fsOptions.lang.buttonSelectAll);
      }

    }
    else {

      var limit_state = _limitText();
      
      if (limit_state === false) {
        btn.find('input.fs-friends').attr('checked', false);

        return false;
      }

      selected_friend_count++;

      btn.addClass('checked');
      btn.find('input.fs-friends').attr('checked', true);
    }

    _showFriendCount();
  },

  _stopEvent = function() {

    $('#fs-reset').undelegate("click.fs");
    $('#fs-user-list li').undelegate("click.fs");
    selected_friend_count = 1;
    $('#fs-select-all').undelegate("click.fs");

  },

  _charLimit = function(word, limit){

    var wlen = word.length;

    if ( wlen <= limit ) {
      return word;
    }

    return word.substr(0, limit) + '...';

  },

  _find = function(t) {

    var fs_dialog = $('#fs-dialog');
    var container = $('#fs-user-list ul');

    search_text_base = $.trim(t.val());

    if(search_text_base === ''){
      $.each(container.children(), function(){
        $(this).show();
      });

      if ( fs_dialog.has('#fs-summary-box').length ){
        if ( selected_friend_count === 1 ){
          $('#fs-summary-box').remove();
        }
        else{
          $('#fs-result-text').remove();
        }

      }
      return;
    }

    var search_text = search_text_base.toLowerCase().replace(/\s/gi, '0');

    var elements = $('#fs-user-list .fs-fullname[value*='+search_text+']');

   
    container.children().hide();
    $.each(elements, function(){
      $(this).parents('li').show();
    });

    var result_text = '';
    if ( elements.length > 0 && search_text_base > '' ){
      result_text = fsOptions.lang.summaryBoxResult.replace("{0}", '"'+t.val()+'"');
      result_text = result_text.replace("{1}", elements.length);
    }
    else{
      result_text = fsOptions.lang.summaryBoxNoResult.replace("{0}", '"'+t.val()+'"');
    }


    if ( !fs_dialog.has('#fs-summary-box').length ) {
      $('#fs-filter-box').after('<div id="fs-summary-box"><span id="fs-result-text">'+result_text+'</span></div>');
    }
    else if ( !fs_dialog.has('#fs-result-text').length ) {
      $('#fs-summary-box').prepend('<span id="fs-result-text">'+result_text+'</span>');
    }
    else {
      $('#fs-result-text').text(result_text);
    }

  },

  _resize = function( is_started ) {

    windowWidth = $(window).width();
    windowHeight = $(window).height();

    var docHeight = $(document).height(),
        wrapWidth = wrap.width(),
        wrapHeight = wrap.height(),
        wrapLeft = (windowWidth / 2) - (wrapWidth / 2),
        wrapTop = (windowHeight / 2) - (wrapHeight / 2);

    if ( is_started === true ) {
      overlay
        .css({
          'background-color' : fsOptions.overlayColor,
          'opacity' : fsOptions.overlayOpacity,
          'height' : docHeight
        })
        .fadeIn('fast', function(){
          wrap.css({
            left: wrapLeft,
            top: wrapTop
          })
          .fadeIn();
        });
    }
    else{
      wrap
        .stop()
        .animate({
          left: wrapLeft,
          top: wrapTop
        }, 200);

      overlay.css({'height': docHeight});
    }

  },

  _shuffleData = function( array_data ) {
    for (var j, x, i = array_data.length; i; j = parseInt(Math.random() * i, 10), x = array_data[--i], array_data[i] = array_data[j], array_data[j] = x);
    return array_data;
  },

  _limitText = function() {
    if ( selected_friend_count > fsOptions.max && fsOptions.max !== null ) {
      var selected_limit_text = fsOptions.lang.selectedLimitResult.replace('{0}', fsOptions.max);
      $('.fs-limit').html('<span class="fs-limit fs-full">'+selected_limit_text+'</span>');
      return false;
    }
  },

  _showFriendCount = function() {
    if ( selected_friend_count > 1 && fsOptions.showSelectedCount === true ){
    
      var selected_count_text = fsOptions.lang.selectedCountResult.replace('{0}', (selected_friend_count-1));

      if ( !$('#fs-dialog').has('#fs-summary-box').length ) {
        $('#fs-filter-box').after('<div id="fs-summary-box"><span class="fs-limit fs-count">'+selected_count_text+'</span></div>');
      }
      else if ( !$('#fs-dialog').has('.fs-limit.fs-count').length ) {
        $('#fs-summary-box').append('<span class="fs-limit fs-count">'+selected_count_text+'</span>');
      }
      else{
        $('.fs-limit').text(selected_count_text);
      }
    }
    else{

      if ( search_text_base === '' ){
        $('#fs-summary-box').remove();
      }
      else{
        $('.fs-limit').remove();
      }

    }
  },

  _resetSelection = function() {
    $('#fs-user-list li').removeClass('checked');
    $('#fs-user-list input.fs-friends').attr('checked', false);
    
    selected_friend_count = 1;
  },

  _selectAll = function() {
    if (fsOptions.showButtonSelectAll === true && fsOptions.max === null) {
      $('#fs-show-selected').before('<a href="javascript:{}" id="fs-select-all"><span>'+fsOptions.lang.buttonSelectAll+'</span></a> - ');
      
      wrap.delegate('#fs-select-all', 'click.fs', function() {
        if (selected_friend_count - 1 !== $('#fs-user-list li').length) {

          $('#fs-user-list li:hidden').show();
          _resetSelection();

          $('#fs-user-list li').each(function() {
            _select($(this));
          });
                
          $('#fs-select-all').text(fsOptions.lang.buttonDeselectAll);

          if (isShowSelectedActive === true) {
            isShowSelectedActive = false;
            $('#fs-show-selected').text(fsOptions.lang.buttonShowSelected);
          }
          
        }
        else {
          _resetSelection();
          
          _showFriendCount();
          
          $('#fs-select-all').text(fsOptions.lang.buttonSelectAll);
        }
      });
      
    }
  },

  _showSelected = function(t) {
  
    var container = $('#fs-user-list ul'),
        allElements = container.find('li'),
        selectedElements = container.find('li.checked');
    
    if (selectedElements.length !== 0 && selectedElements.length !== allElements.length || isShowSelectedActive === true) {
      if (isShowSelectedActive === true) {
        t.removeClass('active').text(fsOptions.lang.buttonShowSelected);

        container.children().show();

        isShowSelectedActive = false;
      }
      else {
        t.addClass('active').text(fsOptions.lang.buttonShowAll);

        container.children().hide();
        $.each(selectedElements, function(){
          $(this).show();
        });

        isShowSelectedActive = true;
      }
    }

  },

  defaults = {
    max: null,
    excludeIds: [],
    getStoredFriends: [],
    closeOverlayClick: true,
    enableEscapeButton: true,
    overlayOpacity: "0.3",
    overlayColor: '#000',
    closeOnSubmit: false,
    showSelectedCount: true,
    showButtonSelectAll: true,
    addUserGroups: false,
    color: "default",
    lang: {
      title: "Friend Selector",
      buttonSubmit: "Send",
      buttonCancel: "Cancel",
      buttonSelectAll: "Select All",
      buttonDeselectAll: "Deselect All",
      buttonShowSelected: "Show Selected",
      buttonShowAll: "Show All",
      summaryBoxResult: "{1} best results for {0}",
      summaryBoxNoResult: "No results for {0}",
      searchText: "Enter a friend's name",
      fbConnectError: "You must connect to Facebook to see this.",
      selectedCountResult: "You have choosen {0} people.",
      selectedLimitResult: "Limit is {0} people.",
      facebookInviteMessage: "Invite message"
    },
    maxFriendsCount: null,
    showRandom: false,
    facebookInvite: true,
    onPreStart: function(response){ return null; },
    onStart: function(response){ return null; },
    onClose: function(response){ return null; },
    onSubmit: function(response){ return null; }
  };


  $.fn.fSelector = function ( options ) {

    this.unbind("click.fs");
    this.bind("click.fs", function(){
      fsOptions = options;
      _start();
    });
    return this;

  };

})(window, document, jQuery);
