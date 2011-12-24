/*
 * FUNCTIONS JS
 *
 * @author Sevil YILMAZ
 * @version 1.0
 */

jQuery(document).ready(function() {

  // Tabs
  $('.tab-content').hide().filter(':first').show();
  $('.tabs li:first').addClass('active');
  
  $('.tabs a').click(function () {
  
    $('.tabs li').removeClass('active');
    $(this).parent('li').addClass('active');
    
    var activeTab = $(this).attr('href');
    
    $('.tab-content').hide();
    $(activeTab).show();
    return false;
  
  });
  
  // pretyPrint
	prettyPrint();
	
});