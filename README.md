Facebook Friend Selector v1.0
=====

Features
---

Ability to set a maximum number for friend selection
Exclude as many people as you want from the list
Search
Overlay color selection
Overlay opacity selection
Ability to hide the overlay with a mouse click outside the box or a ESC key press
Centers the box on window resize
Ability to close the box onsubmit
Ability to enable or disable to display the number of selected people in the box
Seven color options (easily customizable)
Adaptability of texts to any desired language
Ability to decide what to do onstart
Ability to decide what to do onclose
Easy integration


Frequently Asked Questions
---

**Q:** What is Facebook Friend Selector and what can it do for you?
**A:** It’s a friend selection assistant for your Facebook application or your website that is equipped with Facebook Connect.

**Q:** It seems to be a Facebook tool, is it so?
**A:** It has its Facebook user interface, but is not a Facebook tool.

**Q:** There are already two different friend selectors on Facebook.
**A:** Yes, there are. But Facebook’s present tools, after selecting friends, send invitations or similar notifications to the selected people even if we do not wish to. For example, AppRequests, a Facebook method, sends an application request to the people you select. But this tool returns you your friends ID’s only and you use them as you please.

**Q:** Is its integration easy? Do I need any documentation?
**A:** There are documents among the files provided. If you follow the steps given in this document, you will not have any problem.

**Q:** Do I need any server-side script?
**A:** You do not need any server-side script. You’ll only work with JavaScript as client-side.

**Q:** Do I have to build a Facebook application?
**A:** Yes, you have to have an application on Facebook.

**Q:** Will it mess up my website or application design?
**A:** Because this tool opens as a modal box, it does not alter your design.


Requirements
---

jQuery 1.6.2 or above
Facebook Javascript SDK integration

Demos And Examples
---
[http://facebook-friend-selector.codersgrave.com/](http://facebook-friend-selector.codersgrave.com/)

How to use
---

**Note:** The following statements don't include Facebook integration. As the basics of the application depend on Facebook API, we assume that you do the Facebook integration.

We seperate the Facebook stage not to interfere with the Facebook applications you own that are already online. If you haven't already done the Facebook integration, you can see Facebook Javascript SDK page or go check this example's source.


### 1. Include Necessary Files

Add these lines into your web site's <head> part or depending on the difference of usage, up on the </body> tag.

Loading jQuery from CDN (Content Delivery Network) is recommended

    <link type="text/css" href="/friend-selector/jquery.friend.selector.css" rel="stylesheet" />
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script type="text/javascript" src="/friend-selector/jquery.friend.selector.js"></script>


### 2. Insert the following code into <body> tag

This is the code block where you define the action for friend selector box. You can replace "bt-fs-dialog" name with anything you want. You have to change the class name in Step 3 with the same name.

See the Options and Events tabs for more options

    <script type="text/javascript">
      jQuery(document).ready(function($) {
        $(".bt-fs-dialog").fSelector({
          onSubmit: function(response){
            // example response usage
            var selected_friends = [];
            $.each(response, function(k, v){
              selected_friends[k] = v;
            });
            alert(selected_friends);
          }
        });
      });
    </script>


### 3. Add the following code to your page's <body>

This code can be a button, image or a link. It would be adequate to add "bt-fs-dialog" to the class property definition.

    <a href="javascript:{}" class="bt-fs-dialog">Click here</a>
If all of your definitions are correct, you can see the friend selector box when clicked on the example links.

[http://facebook-friend-selector.codersgrave.com/example/]Click here for basic example

Facebook Friend Selector is licensed under a Creative Commons Attribution 3.0 Unported License.