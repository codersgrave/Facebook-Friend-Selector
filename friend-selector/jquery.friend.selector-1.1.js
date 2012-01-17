/*
 * Facebook Friend Selector
 * Copyright (c) 2011 Coders' Grave - http://codersgrave.com
 * Version: 1.0
 * Requires:
 *   jQuery v1.6.2 or above
 *   Facebook Integration - http://developers.facebook.com/docs/reference/javascript/
 */
(function($) {

  var fsOptions = {},
  running = false,
  windowWidth = 0, windowHeight = 0, selected_friend_count = 1,
  fContent = "", search_text_base = "",
  content, wrap, overlay,
  fbDocUri = "http://developers.facebook.com/docs/reference/javascript/"

  defaults = {
    max: null,
    excludeIds: [],
    closeOverlayClick: true,
    overlayOpacity: "0.3",
    overlayColor: '#000',
    closeOnSubmit: false,
    showSelectedCount: false,
    color: "default",
    lang: {
      title: "Friend Selector",
      buttonSubmit: "Send",
      buttonCancel: "Cancel",
      summaryBoxResult: "{1} best results for {0}",
      summaryBoxNoResult: "No results for {0}",
      searchText: "Enter a friend's name",
      fbConnectError: "You must connect to Facebook to see this.",
      selectedCountResult: "You have choosen {0} people.",
      selectedLimitResult: "Limit is {0} people."
    },
    maxFriendsCount: null,
    showRandom: false,
    facebookInvite: false,
    facebookInviteMessage: "Invite message",
    onStart: function(response){ return null; },
    onClose: function(response){ return null; },
    onSubmit: function(response){ return null; }
  },

  _start = function(){

    if ( typeof FB == "undefined" ){
      alert("Facebook integration is not defined. View "+fbDocUri);
      return false;
    }

    fsOptions = $.extend(true, {}, defaults, fsOptions);

    if ( fsOptions.max > 0 && fsOptions.max != null ) {
      fsOptions.showSelectedCount = true;
    }

    _dialogBox();
    fsOptions.onStart();

  },
  _close = function(){

    wrap.fadeOut(400, function(){
      content.empty();
      wrap.remove();
      _stopEvent();
      overlay.fadeOut(400, function(){
        overlay.remove();
      });
    });

    running = false;
    fsOptions.onClose();

  },
  _submit = function(){

    var selected_friends = [];
    $(".fs-friends:checked").each(function(){
      var splitId = $(this).val().split("-");
      var id = splitId[1];
      selected_friends.push(parseInt(id));
    });

    if ( fsOptions.facebookInvite == true ){

      var friends = '';

      $.each( selected_friends, function(k, v){
        friends += v + ',';
      });

      friends = friends.substr(0, friends.length - 1);

      FB.ui({
        method: 'apprequests',
        message: fsOptions.facebookInviteMessage,
        to: friends
      },function(response){

        if ( response != null ){
          fsOptions.onSubmit(selected_friends);

          if ( fsOptions.closeOnSubmit == true ) {
            _close();
          }
        }

      });
    }
    else{
      fsOptions.onSubmit(selected_friends);

      if ( fsOptions.closeOnSubmit == true ) {
        _close();
      }
    }

  },
  _dialogBox = function(){

    if (running == true) {
      return;
    }

    running = true;

    $("body").append(
      overlay = $('<div id="fs-overlay"></div>'),
      wrap = $('<div id="fs-dialog-box-wrap"></div>')
    );

    wrap.append('<div class="fs-dialog-box-bg" id="fs-dialog-box-bg-n"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-ne"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-e"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-se"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-s"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-sw"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-w"></div><div class="fs-dialog-box-bg" id="fs-dialog-box-bg-nw"></div>');
    wrap.append(
      content = $('<div id="fs-dialog-box-content"></div>')
    );


    var container = '';
    container += '<div class="fs-dialog fs-color-'+fsOptions.color+'">';
    container += '  <h2 class="fs-dialog-title"><span>'+fsOptions.lang.title+'</span></h2>';

    container += '  <div class="fs-filter-box">';
    container += '    <div class="fs-input-wrap">';
    container += '      <input type="text" class="fs-input-text" title="'+fsOptions.lang.searchText+'" />';

    container += '      <a href="javascript:{}" class="fs-close-small">Reset</a>';
    container += '    </div>';
    container += '  </div>';

    container += '  <div class="fs-user-list">';

    container += '    <ul></ul>';

    container += '  </div>';

    container += '  <div class="fs-dialog-buttons">';
    container += '    <a href="javascript:{}" class="fs-button fs-submit-button"><span>'+fsOptions.lang.buttonSubmit+'</span></a>';
    container += '    <a href="javascript:{}" class="fs-button fs-cancel-button"><span>'+fsOptions.lang.buttonCancel+'</span></a>';
    container += '  </div>';

    container += '</div>';


    $(".fs-cancel-button").live("click.fs", function(){
      _close();
    });

    $(".fs-submit-button").live("click.fs", function(){
      _submit();
    });

    $(".fs-cancel-button").live("click.fs", function(){
      _close();
    });

    content.html(container);
    _getFacebookFriend();
    _resize(true);
    _initEvent();

    $(window).resize(function(e){
      _resize(false);
    });

  },
  _getFacebookFriend = function(){

    $(".fs-user-list").append('<div id="fs-loading"></div>');

    FB.api("/me/friends", function(response){

      if ( response.error ){
        alert(fsOptions.lang.fbConnectError);
        _close();
        return false;
      }


      var facebook_friends = response.data;
      var max_friend_control = fsOptions.maxFriendsCount != null && fsOptions.maxFriendsCount > 0;
      if ( fsOptions.showRandom == true || max_friend_control == true ){
        facebook_friends = _shuffleData(response.data);
      }


      $.each(facebook_friends, function(k, v){

        if ( max_friend_control && fsOptions.maxFriendsCount <= k ){
          return false;
        }

        if ($.inArray(parseInt(v.id), fsOptions.excludeIds) >= 0) {
          return true;
        }

        var item = $("<li />");

        var fullname = $('<input class="fs-fullname" type="hidden" name="fullname[]" value="'+v.name.toLowerCase().replace(/\s/gi, "+")+'" />');
        var checkbox = $('<input class="fs-friends" type="checkbox" name="friend[]" value="fs-'+v.id+'" />');
        var image = $('<img class="fs-thumb" src="https://graph.facebook.com/'+v.id+'/picture" />');
        var name = $('<span class="fs-name" />').text(_charLimit(v.name, 15));

        var link = $('<a class="fs-anchor" />', {
          href: 'javascript:{}'
        }).append(fullname, checkbox, image, name).appendTo(item);


        $('.fs-user-list ul').append(item);

      });

      $('#fs-loading').remove();

    });

  },
  _initEvent = function(){

    $('.fs-dialog input').focus(function(){
      if ($(this).val() == $(this)[0].title){
        $(this).val('');
      }
    }).blur(function(){
      if ($(this).val() == ''){
        $(this).val($(this)[0].title);
      }
    }).blur();


    $('.fs-dialog input').keyup(function(e){
      _find($(this));
    });


    $('.fs-close-small').bind('click.fs', function(e) {
      $('.fs-input-text').val('');
      _find($(".fs-dialog input"));
    });


    $('.fs-user-list li').live('click.fs', function(e) {

      if ( $(this).hasClass('checked') ) {

        $(this).removeClass('checked');
        $('input', this).attr('checked', false);

        selected_friend_count--;

      }
      else {

        if ( selected_friend_count > fsOptions.max && fsOptions.max != null ) {
          var selected_limit_text = fsOptions.lang.selectedLimitResult.replace("{0}", fsOptions.max);
          $(".fs-limit").html('<span class="fs-limit fs-full">'+selected_limit_text+'</span>');
          return false;
        }

        selected_friend_count++;

        $(this).addClass('checked');
        $('input', this).attr('checked', true);
      }


      if ( selected_friend_count > 1 && fsOptions.showSelectedCount == true ){

        var selected_count_text = fsOptions.lang.selectedCountResult.replace("{0}", (selected_friend_count-1));

        if ( !$(".fs-dialog").has(".fs-summary-box").length ) {
          $(".fs-filter-box").after('<div class="fs-summary-box"><span class="fs-limit fs-count">'+selected_count_text+'</span></div>');
        }
        else if ( !$(".fs-dialog").has(".fs-limit.fs-count").length ) {
          $(".fs-summary-box").append('<span class="fs-limit fs-count">'+selected_count_text+'</span>');
        }
        else{
          $(".fs-limit").text(selected_count_text);
        }
      }
      else{

        if ( search_text_base == "" ){
          $(".fs-summary-box").remove();
        }
        else{
          $(".fs-limit").remove();
        }

      }

    });

    $(document).keyup(function(e) {
      if (e.which == 27) {
        _close();
      }
    });


    if ( fsOptions.closeOverlayClick == true ) {
      overlay.css({'cursor' : 'pointer'});
      overlay.bind('click.fs', _close);
    }

  },
  _stopEvent = function(){

    $('.fs-close-small').unbind("click.fs");
    $('.fs-user-list li').die("click.fs");
    selected_friend_count = 1;
    $('.fs-cancel-button').die("click.fs");
    $('.fs-submit-button').die("click.fs");

  },
  _charLimit = function(word, limit){

    var wlen = word.length;

    if ( wlen <= limit ) {
      return word;
    }

    return word.substr(0, limit) + "...";

  },
  _find = function(t){

    var fs_dialog = t.parents(".fs-dialog");

    search_text_base = $.trim(t.val());
    search_text = search_text_base.toLowerCase().replace(/\s/gi, "+");

    var elements = fs_dialog.find(".fs-user-list ul li .fs-fullname[value*="+search_text+"]");

    var container = fs_dialog.find(".fs-user-list ul");
    container.children().hide();
    $.each(elements, function(k, v){
      $(this).parents("li").show();
    });



    if ( elements.length > 0 && search_text_base > "" ){
      var result_text = fsOptions.lang.summaryBoxResult.replace("{0}", '"'+t.val()+'"');
      result_text = result_text.replace("{1}", elements.length);
    }
    else{
      var result_text = fsOptions.lang.summaryBoxNoResult.replace("{0}", '"'+t.val()+'"');
    }


    if ( !fs_dialog.has(".fs-summary-box").length ) {
      $(".fs-filter-box").after('<div class="fs-summary-box"><span class="fs-result-text">'+result_text+'</span></div>');
    }
    else if ( !fs_dialog.has(".fs-result-text").length ) {
      $(".fs-summary-box", fs_dialog).prepend('<span class="fs-result-text">'+result_text+'</span>');
    }
    else {
      $(".fs-result-text", fs_dialog).text(result_text);
    }

    if ( search_text_base == "" ){
      if ( fs_dialog.has(".fs-summary-box").length ){

        if ( selected_friend_count == 1 ){
          $(".fs-summary-box", fs_dialog).remove();
        }
        else{
          $(".fs-result-text", fs_dialog).remove();
        }

      }
    }


  },
  _resize = function( is_start ){

    windowWidth = $(window).width();
    windowHeight = $(window).height();
    docHeight = $(document).height();

    var wrapWidth = wrap.width();
    var wrapHeight = wrap.height();
    var wrapLeft = (windowWidth / 2) - (wrapWidth / 2);
    var wrapTop = (windowHeight / 2) - (wrapHeight / 2);

    if ( is_start == true ) {
      overlay
        .css({
          'background-color' : fsOptions.overlayColor,
          'opacity' : fsOptions.overlayOpacity,
          'height' : docHeight
        })
        .fadeIn("fast", function(){
          wrap.css({left: wrapLeft, top: wrapTop}).fadeIn();
        });
    }
    else{
      wrap.stop().animate({left: wrapLeft, top: wrapTop}, 200);
      overlay.css({'height': docHeight});
    }

  },
  _shuffleData = function(array_data){
    for (var j, x, i = array_data.length; i; j = parseInt(Math.random() * i), x = array_data[--i], array_data[i] = array_data[j], array_data[j] = x);
    return array_data;
  }



  $.fn.fSelector = function ( options ) {

    $(this).unbind("click.fs");
    $(this).bind("click.fs", function(e){
      fsOptions = options;
      _start();
    });
    return this;

  };

})(jQuery);