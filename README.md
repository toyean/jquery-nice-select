# jQuery Nice Select

A lightweight jQuery plugin that replaces native select elements with customizable dropdowns.

## Usage

Include jQuery and the plugin.

```html
<script src="path/js/jquery.js"></script>
<script src="path/js/jquery.nice-select.js"></script>
```

Include the plugin styles, either the compiled CSS...

```html
<link rel="stylesheet" href="path/css/nice-select.css">
```
...or, ideally, compile the Less source code (if you use Less) into your main stylesheet for easier customization.

```
path/less/nice-select.less
```

Finally, initialize the plugin.

```javascript
$(document).ready(function() {
  $('select').niceSelect();
});
```

Full documentation and examples at [jquery-nice-select](https://zbp.toyean.com/jquery-nice-select/).