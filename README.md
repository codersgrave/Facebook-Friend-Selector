Facebook Friend Selector v1.2
=====

Features
---

* Ability to set a maximum number for friend selection
* Exclude as many people as you want from the list
* Ability to show random friends list
* Ability to set maximum friends on list
* Search
* Facebook invite option (sends apprequest)
* Ability to select/deselect all friends
* Ability to show selected friends
* Ability to predefine selected friends
* Overlay color selection
* Overlay opacity selection
* Ability to hide the overlay with a mouse click outside the box or a ESC key press
* Centers the box on window resize
* Ability to close the box onsubmit
* Ability to enable or disable to display the number of selected people in the box
* Seven color options (easily customizable)
* Adaptability of texts to any desired language
* Ability to decide what to do onstart
* Ability to decide what to do onclose
* Easy integration


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

Add these lines into your web site's `<head>` part or depending on the difference of usage, up on the `</body>` tag.

Loading jQuery from CDN (Content Delivery Network) is recommended

    <link type="text/css" href="/friend-selector/jquery.friend.selector.css" rel="stylesheet" />
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script type="text/javascript" src="/friend-selector/jquery.friend.selector.js"></script>


### 2. Insert the following code into `<body>` tag

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


### 3. Add the following code to your page's `<body>`

This code can be a button, image or a link. It would be adequate to add "bt-fs-dialog" to the class property definition.

    <a href="javascript:{}" class="bt-fs-dialog">Click here</a>
If all of your definitions are correct, you can see the friend selector box when clicked on the example links.

[Click here](http://facebook-friend-selector.codersgrave.com/example/) for basic example

License
---

Facebook Friend Selector is licensed under a [Creative Commons Attribution 3.0 Unported](http://creativecommons.org/licenses/by/3.0/) License.