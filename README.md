
js-buffer
=

##### a node.js-like Buffer module in browsers

1. useful for handling binary data in browsers.

 A `js-buffer` instance extends ArrayBuffer to handle binary data and is sendable directly to servers without converting to ArrayBuffer or Blob.

 `js-buffer` is available in Safari, Chrome and Firefox. (partially in Opera 12.00 pre-alpha.)
 


2. supports all Buffer APIs of Node.js (v0.4).
 
<br/>

APIs
-

### window.Buffer
see [buffers - Node.js v0.4.12 Manual & Documentation](http://nodejs.org/docs/v0.4.12/api/buffers.html)


License
-

[The MIT License](https://github.com/EastCloud/js-buffer/blob/master/MIT-LICENSE)

Copyright (c) 2011 East Cloud, Inc.

<!--
=Memo=
Version: 20111003 (revision 1459)
Built on: 2011/10/03 11:29
java -jar compiler.jar --js js-buffer/js/buffer.js --js_output_file js-buffer/js/buffer.min.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "`cat js-buffer/js/license.js`"%output%
-->