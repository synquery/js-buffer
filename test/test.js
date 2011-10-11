/***********************************************************************
This file is for testing both in browsers and with node.js.

succeeds with:
Safari 5.1
Google Chrome 14.0.835.202
Firefox 7.0.1
node.js 0.4.12

fails with:
Opera 11.51 (doesn't have ArrayBuffer)
Internet Explore (is not tested but must have some problems)

*********************************************************************/
testFunctions();
testNewBuffer();
testIsBuffer();
testByteLength();
testSlice();
testCopy();
testWrite();
testToString();

function testFunctions() {
  var staticFunctions = ['isBuffer', 'byteLength'];
  var prototypeFunctions = ['write', 'toString', 'copy', 'slice'];

  staticFunctions.forEach(function(fnc) {
    assertEquals('function', typeof Buffer[fnc]);
  });

  var b = new Buffer(0);
  prototypeFunctions.forEach(function(fnc) {
    assertEquals('function', typeof Buffer.prototype[fnc]);
    assertEquals('function', typeof b[fnc]);
  });
}

function testIsBuffer() {
  var isNotBuffers = [undefined, null, false, true, 0, -1000, Math.PI, '',
      'aaa', 'NaN', [], [0, 1, 2], ['&', '%', '$', true], {}, {
        A: 0,
        B: false,
        C: 'Cc.'
      }, function() {
      }];
  isNotBuffers.forEach(function(elem) {
    assertFalse(Buffer.isBuffer(elem));
  });

  var isBuffers = [new Buffer(30), new Buffer('aaa', 'utf8'),
      Buffer('bbb', 'ucs2'), Buffer('ccc', 'ascii'),
      Buffer('QUJDREVGRw==', 'base64'), Buffer([65, 66, 67, 68]),
      Buffer('abcdefg').slice(3, 5)];
  isBuffers.forEach(function(elem) {
    assert(Buffer.isBuffer(elem));
  });
}

function testByteLength() {
  assertEquals(1, Buffer.byteLength('a'));
  assertEquals(1, Buffer.byteLength('b', 'utf8'));
  assertEquals(2, Buffer.byteLength('c', 'ucs2'));
  var d = 'dddddDDdddddd';
  assertEquals(d.length, Buffer.byteLength(d, 'ascii'));
  assertEquals(7, Buffer.byteLength('QUJDREVGRw==', 'base64'));
  assertEquals(23, Buffer.byteLength('¡™£¢∞§¶•ªº'));
  assertEquals(3, Buffer.byteLength('憂'));
}

function testSlice() {
  var i, b = Buffer(100), as, err;
  for(i = 100; i--;)
    b[i] = i;

  as = b.slice(95);
  assertEquals(b[95], as[0]);
  assertEquals(b[99], as[4]);

  as = b.slice(5, 8);
  assertEquals(3, as.length);
  assertEquals(5, as[0]);
  assertEquals(6, as[1]);
  assertEquals(7, as[2]);

  as[1] = 60;
  assertEquals(60, as[1]);
  assertEquals(60, b[6]);

  err = assertThrows(Buffer.prototype.slice, b, [99, 101]);
  assertEquals('oob', err.message);
  err = assertThrows(Buffer.prototype.slice, b, [50, 40]);
  assertEquals('oob', err.message);

  as = b.slice(99, 99);
  assertEquals(0, as.length);
}

function testCopy() {
  var i, b = Buffer(100), err;
  for(i = 100; i--;)
    b[i] = i;
  var target = Buffer(50);

  b.copy(target);
  assertEquals(b[0], target[0]);
  assertEquals(b[20], target[20]);
  assertEquals(b[49], target[49]);

  target[20] = 200;
  assertEquals(200, target[20]);
  assertEquals(20, b[20]);

  b.copy(target, 30);
  assertEquals(b[29], target[29]);
  assertEquals(b[0], target[30]);
  assertEquals(b[10], target[40]);
  assertEquals(b[19], target[49]);

  b.copy(target, 0, 5);
  assertEquals(b[5], target[0]);
  assertEquals(b[25], target[20]);
  assertEquals(b[54], target[49]);

  b.copy(target, 10, 90, 100);
  assertEquals(b[90], target[10]);
  assertEquals(b[99], target[19]);
  assertEquals(b[25], target[20]);

  err = assertThrows(Buffer.prototype.copy, b, [target, 0, 90, 120]);
  assertEquals('sourceEnd out of bounds', err.message);
}

function testToString() {
  var i, b = Buffer(128), err;
  for(i = 128; i--;)
    b[i] = i;

  assertEquals(
      'Ā̂Ԅ܆ईଊഌ༎ᄐጒᔔ᜖ᤘᬚᴜ἞℠⌢┤✦⤨⬪⴬⼮㄰㌲㔴㜶㤸㬺㴼㼾䅀䍂䕄䝆䥈䭊䵌低児卒啔坖奘孚嵜彞慠换敤杦楨歪浬潮煰獲畴睶祸筺絼罾', b
          .toString('ucs-2'));
  assertEquals(
      'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=',
      b.toString('base64'));
  assertEquals(
      ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
      b.slice(32).toString('ascii'));
  assertEquals(
      ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
      b.slice(32, 127).toString('utf-8'));
  assertEquals(b.toString('utf8', 32, 127), b.slice(32, 127).toString('utf-8'));
  assertEquals(b.toString('utf8', 32, 129), b.slice(32, 128).toString('utf-8'));
  assertEquals(b.toString('utf8', 32, 32), b.slice(32, 32).toString('utf-8'));

  var japanese = '純粋な JavaScript は Unicode と相性がいいものの、バイナリデータの扱いはうまくありません。 TCP ストリームやファイルシステムを扱う場合は、オクテットストリームを処理する必要があります。 Node にはオクテットストリームを操作、作成、消費するためにいくつかの戦略があります。';
  assertEquals(japanese, Buffer(japanese).toString());
  assertEquals(japanese, Buffer(japanese, 'ucs2').toString('ucs-2'));

  err = assertThrows(Buffer.prototype.toString, b, ['utf88']);
  assertEquals('Unknown encoding', err.message);

  err = assertThrows(Buffer.prototype.toString, b, ['', 10, 0]);
  assertEquals('Must have start <= end', err.message);
}

function testWrite() {
  var teststr = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
  var multistr = '¡™£¢∞§¶•ªº';
  var base64str = 'iVBORw0KGgoAAAANSUhEUgA=';
  var i, b, len;

  b = Buffer(128);
  for(i = 128; i--;)
    b[i] = 0;
  len = b.write(teststr, 'ascii');
  assertEquals(95, Buffer._charsWritten);
  assertEquals(95, len);
  assertEquals(35, b[3]);
  assertEquals(126, b[94]);

  b = Buffer(95);
  for(i = 95; i--;)
    b[i] = 0;
  len = b.write(teststr);
  assertEquals(95, Buffer._charsWritten);
  assertEquals(95, len);
  assertEquals(35, b[3]);
  assertEquals(126, b[94]);

  b = Buffer(30);
  for(i = 30; i--;)
    b[i] = 0;
  len = b.write(teststr);
  assertEquals(30, Buffer._charsWritten);
  assertEquals(30, len);
  assertEquals(35, b[3]);
  assertEquals(61, b[29]);
  assertEquals(undefined, b[30]);

  b = Buffer(10);
  for(i = 10; i--;)
    b[i] = 100;
  len = b.write(multistr);
  assertEquals(4, Buffer._charsWritten);
  assertEquals(9, len);
  assertEquals('¡™£¢', b.toString('utf8', 0, 9));
  assertEquals(100, b[9]);

  b = Buffer(10);
  for(i = 10; i--;)
    b[i] = 111;
  len = b.write(multistr, 5, 'ucs2');
  assertEquals(2, Buffer._charsWritten);
  assertEquals(4, len);
  assertEquals('¡™', b.toString('ucs2', 5, 9));
  assertEquals(111, b[0]);
  assertEquals(111, b[1]);
  assertEquals(111, b[2]);
  assertEquals(111, b[3]);
  assertEquals(111, b[4]);
  assertEquals(111, b[9]);

  b = Buffer(20);
  for(i = 20; i--;)
    b[i] = 0;
  len = b.write(base64str, 0, 'base64');
  assertEquals(24, Buffer._charsWritten);
  assertEquals(17, len);

  b = Buffer(5);
  for(i = 5; i--;)
    b[i] = 0;
  len = b.write(base64str, 0, 'base64');
  assertEquals(24, Buffer._charsWritten);
  assertEquals(17, len);
}

function testNewBuffer() {
  var i, b, exp;

  var err = assertThrows(function() {
    new Buffer();
  });
  assertEquals('First argument needs to be a number, array or string.',
      err.message);

  b = new Buffer(10);
  assertEquals(10, b.length);

  b = new Buffer('abcdefg0123456日本!"#$%&');
  exp = [97, 98, 99, 100, 101, 102, 103, 48, 49, 50, 51, 52, 53, 54, 230, 151,
      165, 230, 156, 172, 33, 34, 35, 36, 37, 38];
  for(i = b.length; i--;)
    assertEquals(exp[i], b[i]);

  b = new Buffer('abcdefg0123456日本!"#$%&', 'ascii');
  exp = [97, 98, 99, 100, 101, 102, 103, 48, 49, 50, 51, 52, 53, 54, 229, 44,
      33, 34, 35, 36, 37, 38];
  for(i = b.length; i--;)
    assertEquals(exp[i], b[i]);

  b = Buffer(
      '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',
      'base64');
  exp = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0,
      100, 0, 0, 0, 100, 8, 2, 0, 0, 0, 255, 128, 2, 3, 0, 0, 22, 134, 105, 67,
      67, 80, 73, 67, 67, 32, 80, 114, 111, 102, 105, 108, 101, 0, 0, 120, 1,
      173, 120, 121, 60, 85, 81, 215, 255, 62, 119, 230, 94, 243, 60, 207, 243,
      60, 207, 243, 60, 207, 179, 112, 205, 179, 155, 33, 25, 202, 144, 148,
      161, 72, 146, 16, 161, 204, 165, 148, 33, 69, 136, 40, 101, 74, 20, 42,
      67, 146, 162, 164, 132, 144, 223, 81, 191, 122, 158, 63, 222, 247, 191,
      119, 127, 62, 231, 156, 239, 89, 103, 157, 117, 246, 222, 107, 157, 189,
      215, 250, 2, 192, 204, 78, 36, 145, 66, 17, 212, 0, 132, 133, 71, 71,
      218, 26, 233, 114, 59, 187, 184, 114, 99, 167, 1, 22, 48, 3, 70, 32, 0,
      88, 137, 62, 81, 36, 29, 107, 107, 115, 240, 191, 182, 31, 19, 0, 58,
      120, 248, 92, 226, 192, 214, 255, 170, 246, 63, 63, 160, 241, 245, 139,
      242, 1, 0, 178, 134, 31, 123, 251, 70, 249, 132, 193, 248, 14, 124, 112,
      251, 144, 34, 163, 1, 64, 140, 195, 114, 190, 216, 104, 210, 1, 222, 130,
      49, 125, 36, 220, 65, 0, 144, 132, 3, 28, 240, 7, 115, 31, 96, 239, 63,
      88, 254, 183, 142, 189, 173, 30, 172, 99, 12, 0, 142, 64, 36, 70, 6, 0,
      128, 183, 135, 229, 220, 71, 124, 2, 96, 59, 120, 248, 192, 208, 134,
      251, 6, 133, 3, 64, 115, 26, 198, 154, 62, 129, 68, 95, 0, 152, 6, 96,
      29, 241, 176, 176, 136, 3, 252, 29, 198, 194, 222, 255, 101, 39, 224,
      191, 48, 145, 232, 253, 207, 38, 145, 24, 240, 15, 255, 25, 11, 252, 38,
      252, 97, 253, 160, 40, 82, 40, 49, 238, 247, 205, 255, 229, 41, 44, 52,
      6, 158, 175, 223, 141, 17, 62, 19, 72, 209, 186, 182, 240, 21, 7, 207,
      25, 115, 80, 180, 201, 193, 56, 127, 227, 192, 24, 99, 135, 191, 56, 62,
      208, 222, 233, 47, 14, 247, 182, 180, 250, 139, 125, 162, 244, 224, 185,
      252, 163, 31, 18, 97, 246, 207, 142, 175, 159, 190, 193, 95, 121, 212,
      17, 187, 127, 56, 62, 80, 207, 242, 175, 60, 152, 104, 122, 224, 179,
      223, 223, 34, 70, 194, 232, 255, 99, 82, 180, 245, 191, 62, 132, 135, 90,
      30, 196, 205, 111, 29, 255, 72, 195, 127, 246, 253, 162, 12, 236, 254,
      202, 163, 35, 237, 255, 201, 253, 131, 12, 77, 254, 202, 73, 161, 191,
      99, 238, 247, 187, 145, 49, 182, 255, 198, 226, 23, 238, 240, 239, 93,
      95, 162, 190, 217, 95, 125, 16, 4, 44, 0, 17, 248, 68, 251, 29, 133, 253,
      11, 128, 94, 4, 41, 46, 50, 40, 32, 48, 154, 91, 7, 142, 74, 63, 113,
      110, 147, 112, 31, 73, 113, 110, 89, 105, 25, 25, 112, 16, 227, 7, 58, 0,
      124, 179, 253, 29, 187, 16, 227, 240, 127, 100, 145, 98, 0, 168, 73, 192,
      241, 70, 251, 31, 153, 23, 220, 199, 214, 42, 0, 168, 37, 254, 35, 227,
      119, 1, 128, 66, 18, 128, 174, 207, 62, 49, 145, 71, 254, 216, 67, 29,
      92, 208, 128, 28, 80, 1, 122, 192, 2, 56, 1, 31, 16, 6, 18, 64, 22, 40,
      2, 53, 160, 13, 12, 128, 41, 176, 2, 246, 192, 5, 120, 0, 31, 16, 8, 194,
      64, 36, 136, 5, 137, 32, 5, 164, 131, 44, 144, 11, 46, 128, 34, 80, 6,
      42, 65, 13, 184, 14, 154, 64, 43, 184, 15, 186, 193, 35, 48, 8, 70, 192,
      11, 48, 13, 102, 193, 34, 248, 4, 214, 192, 15, 176, 3, 65, 16, 22, 162,
      128, 232, 32, 22, 136, 11, 18, 128, 196, 32, 89, 72, 25, 210, 132, 12,
      32, 115, 200, 22, 114, 129, 188, 160, 0, 40, 28, 138, 129, 18, 161, 19,
      80, 22, 148, 7, 21, 65, 229, 80, 45, 116, 11, 186, 11, 117, 67, 143, 161,
      81, 232, 21, 52, 7, 45, 67, 235, 208, 79, 4, 18, 65, 64, 208, 35, 56, 16,
      130, 8, 41, 132, 50, 66, 7, 97, 134, 176, 71, 28, 66, 4, 32, 14, 35, 226,
      17, 105, 136, 179, 136, 66, 68, 5, 162, 1, 209, 130, 232, 70, 12, 34, 94,
      32, 102, 17, 159, 16, 27, 72, 128, 196, 35, 25, 145, 60, 72, 9, 164, 50,
      82, 15, 105, 133, 116, 69, 250, 35, 35, 145, 199, 145, 153, 200, 2, 100,
      5, 242, 6, 178, 29, 217, 143, 124, 142, 156, 69, 174, 32, 183, 81, 24,
      20, 29, 138, 27, 37, 129, 82, 67, 25, 163, 28, 80, 62, 168, 195, 168,
      227, 168, 108, 84, 17, 170, 6, 213, 130, 234, 69, 61, 71, 205, 161, 214,
      80, 191, 208, 20, 104, 118, 180, 24, 90, 21, 109, 130, 118, 70, 7, 160,
      99, 209, 233, 232, 2, 116, 21, 186, 25, 221, 135, 126, 129, 94, 68, 255,
      192, 96, 48, 140, 24, 33, 140, 18, 198, 24, 227, 130, 9, 198, 36, 96,
      178, 49, 151, 49, 141, 152, 46, 204, 40, 102, 1, 179, 129, 197, 98, 89,
      176, 98, 88, 13, 172, 21, 150, 136, 141, 198, 166, 99, 47, 97, 27, 176,
      15, 176, 99, 216, 69, 236, 22, 14, 143, 227, 194, 201, 226, 12, 113, 174,
      184, 112, 92, 42, 174, 0, 87, 135, 235, 196, 141, 225, 150, 112, 59, 100,
      212, 100, 2, 100, 170, 100, 86, 100, 190, 100, 113, 100, 57, 100, 87,
      201, 218, 201, 134, 201, 22, 201, 118, 200, 105, 200, 133, 200, 53, 200,
      237, 201, 131, 201, 83, 200, 11, 201, 111, 144, 247, 145, 207, 144, 127,
      195, 227, 241, 188, 120, 21, 188, 13, 62, 8, 159, 140, 47, 196, 223, 196,
      15, 224, 231, 240, 219, 4, 90, 130, 40, 65, 143, 224, 78, 136, 33, 156,
      37, 84, 19, 186, 8, 175, 8, 223, 40, 40, 40, 4, 41, 180, 41, 92, 41, 162,
      41, 206, 82, 212, 82, 60, 164, 120, 67, 177, 69, 73, 71, 41, 73, 105, 66,
      233, 75, 153, 68, 89, 76, 217, 66, 57, 70, 249, 153, 138, 140, 74, 128,
      74, 135, 202, 131, 42, 158, 170, 128, 234, 54, 213, 48, 213, 10, 53, 25,
      181, 32, 181, 30, 53, 145, 250, 56, 117, 49, 245, 93, 234, 73, 234, 13,
      26, 58, 26, 25, 26, 43, 154, 48, 154, 108, 154, 58, 154, 199, 52, 31,
      104, 177, 180, 130, 180, 6, 180, 190, 180, 105, 180, 149, 180, 15, 105,
      23, 232, 144, 116, 124, 116, 122, 116, 62, 116, 39, 232, 174, 210, 245,
      209, 45, 210, 99, 232, 133, 232, 77, 232, 131, 233, 179, 232, 175, 211,
      15, 209, 175, 49, 208, 50, 200, 51, 56, 50, 28, 101, 40, 102, 232, 96,
      152, 101, 68, 50, 10, 50, 154, 48, 134, 50, 230, 48, 54, 49, 78, 48, 254,
      100, 226, 96, 210, 97, 242, 99, 202, 96, 186, 193, 52, 198, 180, 201,
      204, 198, 172, 205, 236, 199, 156, 201, 220, 200, 252, 130, 249, 39, 11,
      55, 139, 1, 75, 8, 203, 57, 150, 86, 150, 215, 172, 40, 86, 81, 86, 27,
      214, 88, 214, 82, 214, 62, 214, 21, 54, 122, 54, 53, 54, 31, 182, 76,
      182, 38, 182, 41, 118, 4, 187, 40, 187, 45, 123, 2, 123, 37, 251, 83,
      246, 13, 14, 78, 14, 35, 14, 18, 199, 37, 142, 135, 28, 43, 156, 140,
      156, 218, 156, 193, 156, 249, 156, 157, 156, 203, 92, 116, 92, 154, 92,
      65, 92, 249, 92, 15, 184, 62, 114, 51, 112, 235, 112, 135, 114, 23, 114,
      247, 114, 175, 241, 176, 243, 24, 243, 196, 240, 148, 243, 12, 241, 236,
      240, 10, 241, 58, 240, 166, 242, 54, 242, 190, 230, 35, 231, 83, 230,
      243, 231, 203, 231, 235, 225, 91, 227, 231, 226, 183, 224, 79, 228, 175,
      231, 159, 18, 32, 19, 80, 22, 8, 20, 184, 40, 208, 47, 176, 41, 40, 36,
      232, 36, 120, 74, 176, 85, 240, 131, 16, 179, 144, 137, 80, 188, 80, 189,
      208, 140, 48, 133, 176, 150, 240, 97, 225, 10, 225, 113, 17, 140, 136,
      178, 72, 136, 200, 101, 145, 17, 81, 132, 168, 130, 104, 160, 104, 177,
      232, 176, 24, 66, 76, 81, 44, 72, 236, 178, 216, 168, 56, 90, 92, 69, 60,
      92, 188, 66, 124, 82, 130, 32, 161, 35, 113, 68, 162, 94, 98, 78, 146,
      81, 210, 92, 50, 85, 178, 85, 242, 179, 20, 191, 148, 171, 212, 57, 169,
      126, 169, 95, 210, 10, 210, 161, 210, 87, 165, 167, 101, 104, 101, 76,
      101, 82, 101, 218, 101, 214, 101, 69, 101, 125, 100, 139, 101, 199, 229,
      40, 228, 12, 229, 146, 228, 218, 228, 190, 202, 139, 201, 251, 201, 151,
      202, 191, 84, 160, 83, 176, 80, 56, 165, 208, 163, 176, 167, 168, 164,
      24, 169, 120, 67, 113, 89, 137, 95, 201, 75, 169, 68, 105, 82, 153, 94,
      217, 90, 57, 91, 121, 64, 5, 173, 162, 171, 146, 164, 114, 95, 101, 91,
      85, 81, 53, 90, 181, 73, 245, 139, 154, 132, 90, 136, 90, 157, 218, 7,
      117, 33, 117, 63, 245, 171, 234, 11, 26, 188, 26, 68, 141, 114, 141, 89,
      77, 110, 77, 47, 205, 43, 154, 179, 90, 60, 90, 68, 173, 10, 173, 121,
      109, 62, 109, 95, 237, 42, 237, 37, 29, 17, 157, 96, 157, 6, 157, 207,
      186, 210, 186, 145, 186, 205, 186, 155, 122, 170, 122, 199, 244, 186,
      244, 145, 250, 70, 250, 153, 250, 67, 6, 180, 6, 14, 6, 69, 6, 111, 12,
      121, 13, 3, 12, 235, 13, 215, 140, 20, 140, 18, 140, 186, 140, 209, 198,
      102, 198, 231, 140, 39, 77, 56, 76, 124, 76, 106, 77, 214, 76, 149, 76,
      143, 153, 246, 154, 17, 204, 236, 204, 138, 204, 230, 205, 69, 205, 35,
      205, 219, 45, 16, 22, 166, 22, 231, 45, 102, 44, 5, 44, 195, 45, 91, 173,
      128, 149, 137, 213, 121, 171, 215, 214, 66, 214, 135, 173, 239, 217, 96,
      108, 172, 109, 138, 109, 222, 219, 202, 216, 38, 218, 246, 219, 209, 217,
      121, 218, 213, 217, 253, 176, 215, 181, 207, 177, 159, 118, 16, 118, 136,
      113, 232, 113, 164, 114, 116, 119, 172, 117, 220, 116, 210, 119, 202,
      115, 154, 117, 150, 114, 62, 230, 60, 232, 194, 234, 18, 228, 210, 230,
      138, 117, 117, 116, 173, 114, 221, 112, 51, 112, 187, 224, 182, 232, 174,
      224, 158, 238, 62, 113, 72, 232, 208, 209, 67, 143, 61, 88, 61, 66, 61,
      58, 60, 169, 60, 137, 158, 183, 189, 208, 94, 78, 94, 117, 94, 187, 68,
      43, 98, 5, 113, 195, 219, 196, 187, 196, 123, 205, 71, 207, 231, 162,
      207, 39, 95, 109, 223, 124, 223, 101, 63, 13, 191, 60, 191, 37, 127, 13,
      255, 60, 255, 15, 1, 26, 1, 231, 3, 150, 3, 181, 2, 11, 2, 87, 130, 244,
      130, 138, 130, 190, 6, 27, 7, 151, 5, 111, 134, 88, 133, 84, 135, 236,
      135, 58, 133, 54, 134, 225, 194, 188, 194, 238, 134, 211, 134, 135, 132,
      247, 70, 112, 70, 28, 141, 24, 37, 137, 145, 210, 73, 179, 135, 85, 15,
      95, 56, 188, 22, 105, 22, 89, 21, 5, 69, 29, 138, 106, 139, 166, 135,
      147, 137, 167, 49, 194, 49, 39, 99, 230, 142, 104, 30, 41, 62, 178, 21,
      235, 24, 123, 251, 40, 205, 209, 240, 163, 79, 227, 68, 227, 50, 226,
      150, 226, 13, 227, 175, 37, 160, 18, 124, 18, 122, 18, 121, 18, 83, 18,
      231, 142, 233, 28, 43, 63, 14, 29, 247, 62, 222, 147, 196, 151, 148, 150,
      180, 152, 108, 148, 92, 147, 66, 158, 18, 146, 242, 44, 85, 58, 53, 47,
      245, 251, 9, 167, 19, 237, 105, 28, 105, 201, 105, 11, 39, 141, 78, 214,
      167, 83, 166, 71, 166, 79, 158, 82, 59, 85, 118, 26, 117, 58, 232, 244,
      80, 134, 92, 198, 165, 140, 95, 153, 190, 153, 79, 178, 164, 179, 10,
      178, 118, 179, 125, 178, 159, 156, 145, 57, 83, 120, 102, 255, 172, 255,
      217, 161, 28, 197, 156, 210, 92, 76, 110, 120, 238, 196, 57, 173, 115,
      53, 121, 52, 121, 241, 121, 11, 231, 45, 206, 183, 228, 115, 231, 103,
      230, 127, 191, 224, 121, 225, 113, 129, 124, 65, 217, 69, 242, 139, 49,
      23, 103, 11, 205, 11, 219, 46, 241, 95, 202, 189, 180, 91, 20, 88, 244,
      162, 88, 183, 184, 177, 132, 189, 36, 163, 100, 243, 178, 239, 229, 177,
      82, 237, 210, 27, 101, 28, 101, 89, 101, 63, 175, 4, 93, 121, 89, 110,
      84, 222, 82, 33, 88, 81, 80, 137, 169, 60, 82, 249, 254, 170, 227, 213,
      254, 107, 202, 215, 106, 171, 88, 171, 178, 170, 246, 170, 195, 171, 103,
      107, 108, 107, 122, 107, 149, 106, 107, 235, 216, 235, 114, 234, 17, 245,
      49, 245, 203, 13, 238, 13, 35, 215, 245, 175, 183, 221, 144, 184, 81,
      222, 200, 216, 152, 117, 19, 220, 140, 185, 249, 241, 150, 215, 173, 137,
      38, 179, 166, 158, 219, 202, 183, 111, 220, 17, 184, 83, 210, 76, 215,
      156, 217, 2, 181, 196, 181, 172, 181, 6, 182, 206, 182, 185, 180, 141,
      222, 53, 189, 219, 211, 174, 214, 222, 124, 79, 242, 94, 245, 125, 158,
      251, 197, 29, 12, 29, 57, 157, 228, 157, 105, 157, 251, 15, 226, 31, 108,
      116, 145, 186, 86, 186, 3, 186, 23, 122, 60, 123, 166, 31, 58, 63, 28,
      239, 181, 233, 29, 234, 51, 235, 27, 120, 100, 248, 232, 97, 191, 78,
      255, 131, 1, 141, 129, 251, 143, 85, 31, 223, 125, 162, 252, 164, 117,
      80, 113, 176, 229, 169, 194, 211, 230, 103, 10, 207, 154, 135, 20, 135,
      90, 134, 149, 134, 219, 70, 84, 70, 218, 71, 213, 71, 59, 199, 180, 198,
      186, 159, 235, 63, 127, 52, 110, 50, 62, 248, 194, 242, 197, 232, 132,
      195, 196, 203, 73, 247, 201, 217, 151, 190, 47, 63, 188, 10, 125, 245,
      117, 234, 200, 212, 206, 116, 242, 12, 122, 38, 243, 53, 245, 235, 130,
      55, 236, 111, 42, 222, 138, 188, 109, 156, 85, 156, 237, 152, 211, 159,
      123, 58, 111, 55, 63, 189, 224, 179, 240, 233, 93, 212, 187, 221, 197,
      180, 247, 20, 239, 11, 150, 184, 150, 106, 63, 200, 126, 184, 191, 108,
      184, 60, 242, 209, 237, 227, 226, 39, 210, 167, 157, 149, 244, 85, 154,
      213, 146, 207, 194, 159, 239, 124, 209, 254, 242, 116, 205, 121, 109,
      241, 107, 228, 215, 253, 245, 236, 111, 44, 223, 170, 191, 203, 127, 239,
      217, 176, 222, 120, 243, 35, 236, 199, 206, 102, 230, 22, 203, 86, 205,
      182, 242, 118, 255, 79, 167, 159, 75, 59, 177, 187, 216, 221, 194, 61,
      145, 189, 246, 95, 102, 191, 102, 246, 195, 246, 247, 73, 196, 72, 226,
      239, 92, 0, 9, 159, 17, 254, 254, 0, 172, 87, 195, 121, 2, 156, 43, 208,
      141, 0, 64, 78, 249, 39, 7, 253, 173, 1, 167, 168, 112, 226, 140, 128,
      49, 37, 208, 1, 87, 32, 78, 232, 50, 66, 5, 241, 9, 121, 29, 149, 130,
      246, 193, 56, 98, 157, 113, 222, 100, 169, 228, 37, 248, 62, 194, 38, 37,
      7, 149, 21, 245, 49, 154, 70, 218, 9, 186, 93, 6, 122, 70, 113, 38, 21,
      102, 43, 22, 15, 214, 104, 182, 108, 246, 107, 28, 15, 56, 39, 184, 22,
      184, 87, 121, 190, 242, 174, 241, 45, 243, 207, 11, 76, 10, 14, 10, 117,
      10, 55, 138, 148, 139, 230, 137, 165, 136, 147, 36, 60, 36, 173, 164, 52,
      165, 165, 101, 132, 101, 57, 228, 24, 228, 41, 21, 80, 10, 219, 138, 159,
      148, 222, 40, 143, 170, 244, 168, 54, 169, 85, 168, 231, 105, 36, 105,
      134, 105, 185, 107, 155, 234, 40, 234, 242, 233, 81, 233, 109, 235, 207,
      25, 60, 54, 188, 105, 84, 96, 156, 104, 66, 52, 53, 48, 19, 54, 199, 155,
      175, 88, 12, 91, 222, 182, 42, 180, 78, 182, 9, 179, 117, 183, 51, 183,
      215, 112, 144, 112, 100, 119, 34, 119, 218, 116, 94, 112, 25, 118, 189,
      231, 86, 229, 126, 238, 80, 130, 135, 159, 167, 173, 151, 30, 81, 217,
      91, 198, 71, 220, 87, 200, 143, 207, 159, 51, 128, 41, 144, 38, 136, 60,
      24, 10, 222, 10, 249, 18, 186, 24, 54, 19, 62, 30, 49, 66, 26, 57, 252,
      34, 242, 117, 212, 82, 244, 122, 204, 94, 44, 246, 40, 77, 28, 91, 60,
      95, 130, 88, 162, 236, 49, 229, 227, 154, 73, 218, 201, 218, 41, 234,
      169, 242, 39, 68, 211, 184, 78, 210, 166, 163, 211, 183, 78, 45, 159,
      158, 202, 24, 204, 188, 159, 85, 159, 93, 124, 38, 235, 108, 98, 78, 68,
      110, 192, 57, 223, 60, 255, 243, 33, 249, 145, 23, 226, 11, 82, 47, 102,
      20, 230, 92, 186, 80, 84, 84, 92, 86, 82, 121, 185, 186, 180, 190, 236,
      246, 149, 142, 242, 193, 138, 233, 202, 207, 215, 16, 85, 12, 213, 34,
      53, 26, 181, 86, 117, 222, 245, 49, 13, 167, 174, 23, 222, 168, 111, 236,
      184, 57, 122, 107, 169, 105, 239, 14, 125, 179, 88, 139, 78, 171, 83, 91,
      232, 221, 228, 246, 124, 56, 118, 219, 59, 134, 59, 151, 186, 208, 221,
      98, 61, 174, 15, 115, 123, 159, 60, 194, 246, 27, 12, 164, 62, 126, 240,
      100, 247, 169, 242, 179, 200, 161, 250, 225, 249, 81, 186, 49, 221, 231,
      225, 227, 23, 95, 60, 152, 120, 255, 146, 240, 74, 118, 202, 105, 58,
      113, 166, 252, 245, 163, 55, 43, 179, 12, 115, 122, 243, 49, 11, 245,
      239, 230, 223, 179, 44, 89, 125, 56, 185, 124, 247, 227, 231, 21, 222,
      85, 251, 207, 41, 95, 174, 173, 221, 251, 218, 181, 222, 252, 173, 252,
      251, 169, 141, 224, 31, 230, 155, 146, 91, 212, 91, 235, 219, 227, 63,
      91, 118, 10, 119, 227, 247, 220, 126, 105, 236, 115, 238, 239, 195, 254,
      39, 0, 101, 144, 1, 33, 160, 104, 4, 26, 81, 141, 244, 68, 9, 163, 1,
      122, 30, 243, 6, 59, 137, 155, 39, 251, 129, 71, 16, 184, 40, 180, 41,
      137, 84, 169, 212, 21, 52, 221, 180, 83, 116, 203, 244, 27, 140, 72, 38,
      28, 51, 51, 11, 63, 171, 60, 155, 49, 187, 51, 135, 31, 103, 56, 23, 137,
      59, 136, 135, 200, 107, 195, 167, 197, 47, 33, 192, 44, 8, 4, 63, 9, 141,
      11, 223, 19, 169, 16, 61, 45, 22, 33, 110, 47, 161, 44, 201, 33, 133,
      144, 90, 150, 30, 147, 233, 144, 173, 145, 203, 151, 79, 81, 8, 85, 116,
      80, 210, 84, 22, 86, 161, 86, 217, 80, 157, 86, 235, 86, 175, 210, 200,
      210, 140, 208, 178, 213, 86, 208, 97, 210, 217, 214, 125, 165, 215, 166,
      127, 209, 224, 136, 161, 131, 145, 172, 49, 165, 241, 71, 147, 62, 211,
      43, 102, 9, 230, 14, 22, 82, 150, 56, 203, 5, 171, 46, 235, 43, 54, 105,
      182, 65, 118, 54, 246, 74, 14, 92, 142, 24, 199, 85, 167, 49, 231, 86,
      151, 98, 215, 36, 55, 31, 119, 163, 67, 162, 30, 20, 30, 235, 158, 83,
      94, 143, 136, 205, 222, 213, 62, 37, 190, 185, 126, 39, 253, 227, 2, 194,
      3, 137, 65, 246, 193, 134, 33, 202, 161, 34, 97, 108, 225, 20, 17, 136,
      136, 109, 210, 247, 195, 235, 145, 223, 163, 182, 162, 127, 29, 65, 192,
      145, 128, 143, 163, 140, 167, 78, 160, 75, 100, 56, 198, 120, 156, 49,
      137, 62, 153, 58, 5, 151, 178, 151, 186, 118, 98, 46, 109, 244, 100, 87,
      122, 227, 169, 203, 167, 179, 51, 226, 50, 3, 178, 236, 179, 117, 206,
      72, 158, 101, 207, 33, 228, 130, 220, 173, 115, 27, 121, 27, 231, 183,
      242, 247, 10, 160, 139, 232, 66, 178, 75, 20, 69, 212, 197, 180, 37, 244,
      151, 153, 74, 89, 203, 56, 175, 8, 150, 75, 87, 104, 85, 90, 95, 245,
      190, 22, 93, 117, 170, 250, 82, 77, 93, 237, 189, 186, 193, 250, 233,
      134, 143, 215, 127, 54, 146, 223, 100, 191, 37, 213, 100, 112, 219, 253,
      78, 84, 115, 86, 75, 101, 235, 189, 182, 177, 187, 203, 237, 251, 247,
      25, 59, 36, 59, 141, 31, 4, 118, 229, 116, 63, 232, 217, 238, 85, 235,
      75, 122, 244, 104, 0, 255, 216, 230, 201, 197, 193, 233, 103, 92, 67,
      222, 195, 149, 35, 115, 99, 236, 207, 237, 199, 179, 94, 116, 79, 108,
      190, 20, 123, 229, 57, 117, 126, 122, 96, 102, 247, 141, 220, 219, 176,
      217, 134, 185, 245, 5, 237, 119, 121, 139, 239, 151, 212, 62, 228, 46,
      191, 251, 164, 180, 146, 177, 250, 234, 11, 239, 154, 247, 215, 194, 245,
      222, 111, 31, 54, 48, 63, 120, 54, 213, 182, 28, 182, 195, 127, 158, 218,
      41, 219, 109, 221, 27, 254, 181, 244, 219, 255, 120, 32, 3, 142, 130,
      121, 56, 119, 159, 68, 248, 35, 113, 200, 86, 84, 44, 218, 16, 195, 131,
      197, 224, 32, 220, 38, 57, 132, 71, 17, 88, 41, 100, 41, 141, 168, 252,
      169, 83, 104, 202, 104, 91, 233, 70, 233, 223, 49, 236, 51, 49, 49, 43,
      179, 56, 178, 198, 178, 21, 178, 55, 115, 60, 225, 156, 226, 154, 227,
      158, 229, 153, 226, 125, 198, 215, 205, 223, 36, 80, 33, 152, 39, 148,
      34, 76, 18, 57, 36, 106, 44, 38, 39, 206, 37, 129, 149, 248, 42, 57, 45,
      213, 39, 221, 40, 83, 34, 155, 33, 23, 43, 239, 175, 96, 171, 168, 169,
      36, 162, 76, 167, 188, 171, 178, 168, 250, 76, 237, 142, 122, 177, 70,
      138, 166, 159, 150, 137, 182, 184, 14, 37, 156, 105, 60, 211, 171, 215,
      207, 48, 8, 48, 52, 48, 226, 54, 218, 49, 158, 48, 185, 105, 154, 97,
      230, 109, 174, 102, 65, 107, 177, 108, 217, 109, 85, 108, 29, 107, 227,
      104, 171, 100, 199, 98, 183, 107, 255, 214, 161, 219, 177, 194, 233, 132,
      179, 175, 139, 190, 43, 159, 27, 194, 109, 214, 189, 243, 80, 137, 71,
      130, 167, 187, 151, 54, 81, 208, 155, 218, 123, 207, 231, 163, 239, 75,
      191, 62, 255, 91, 1, 165, 129, 25, 65, 209, 193, 158, 33, 38, 161, 114,
      97, 28, 225, 184, 240, 239, 17, 11, 164, 137, 195, 79, 35, 31, 69, 245,
      68, 119, 198, 220, 59, 210, 18, 219, 116, 244, 122, 92, 77, 124, 69, 66,
      113, 98, 254, 177, 51, 199, 211, 146, 226, 146, 67, 82, 92, 82, 245, 79,
      72, 164, 49, 164, 237, 158, 92, 72, 127, 124, 170, 241, 116, 62, 28, 3,
      30, 89, 186, 217, 130, 103, 200, 207, 124, 57, 251, 34, 167, 51, 183,
      254, 92, 105, 222, 133, 243, 57, 249, 89, 23, 210, 11, 82, 46, 38, 20,
      198, 92, 138, 40, 10, 44, 246, 42, 113, 190, 108, 83, 106, 90, 102, 112,
      69, 191, 220, 176, 194, 188, 210, 225, 170, 215, 181, 144, 170, 35, 213,
      41, 53, 89, 181, 5, 117, 87, 234, 235, 26, 238, 92, 239, 188, 209, 223,
      248, 252, 230, 236, 173, 47, 77, 251, 119, 168, 155, 121, 90, 100, 91,
      245, 218, 236, 239, 250, 181, 31, 185, 151, 126, 191, 160, 163, 166, 243,
      254, 131, 151, 93, 123, 61, 146, 15, 253, 123, 175, 246, 189, 239, 23,
      30, 8, 126, 220, 240, 100, 245, 169, 196, 179, 176, 161, 134, 225, 143,
      163, 2, 99, 158, 207, 47, 142, 15, 77, 160, 39, 85, 95, 146, 94, 85, 77,
      189, 158, 161, 125, 109, 250, 38, 237, 237, 195, 57, 138, 121, 207, 133,
      246, 69, 182, 247, 199, 151, 22, 150, 141, 62, 54, 172, 208, 172, 30,
      253, 252, 118, 205, 228, 107, 243, 55, 222, 239, 185, 27, 251, 155, 97,
      91, 51, 63, 77, 119, 90, 247, 4, 126, 229, 29, 248, 255, 15, 23, 113,
      176, 39, 96, 20, 1, 184, 186, 9, 128, 227, 41, 0, 44, 225, 218, 178, 92,
      16, 0, 1, 184, 222, 165, 160, 7, 192, 154, 2, 0, 123, 21, 128, 64, 115,
      2, 232, 77, 27, 128, 158, 104, 252, 219, 63, 48, 112, 189, 201, 2, 248,
      129, 52, 208, 128, 43, 76, 23, 16, 0, 87, 149, 167, 193, 37, 80, 15, 30,
      128, 231, 96, 25, 236, 67, 76, 144, 12, 92, 27, 6, 67, 25, 80, 61, 244,
      12, 90, 71, 48, 33, 52, 17, 126, 136, 28, 196, 93, 196, 123, 184, 150,
      51, 70, 30, 67, 54, 35, 215, 224, 58, 45, 12, 213, 136, 250, 142, 86, 67,
      167, 161, 71, 48, 156, 152, 8, 76, 55, 150, 17, 27, 138, 237, 193, 177,
      225, 98, 112, 163, 100, 210, 100, 121, 100, 155, 228, 30, 228, 253, 120,
      121, 124, 37, 129, 158, 144, 65, 1, 40, 226, 40, 54, 40, 163, 41, 55,
      168, 226, 168, 33, 234, 108, 26, 86, 154, 6, 90, 109, 218, 151, 116, 81,
      244, 52, 244, 77, 12, 78, 12, 123, 140, 215, 152, 44, 153, 126, 48, 151,
      178, 24, 179, 124, 103, 173, 100, 115, 96, 199, 179, 247, 114, 36, 115,
      106, 113, 65, 92, 143, 184, 207, 242, 184, 240, 242, 243, 126, 230, 107,
      229, 79, 18, 48, 22, 164, 19, 156, 21, 186, 37, 124, 82, 196, 77, 84, 65,
      140, 86, 108, 93, 252, 133, 68, 187, 100, 185, 212, 105, 233, 48, 25,
      107, 89, 89, 57, 122, 185, 77, 249, 25, 133, 94, 197, 27, 74, 197, 202,
      153, 42, 199, 84, 35, 213, 130, 213, 253, 52, 124, 52, 3, 180, 72, 218,
      201, 58, 5, 186, 183, 244, 70, 244, 191, 25, 178, 24, 233, 25, 147, 76,
      174, 152, 142, 155, 227, 45, 12, 44, 83, 225, 149, 106, 207, 86, 209, 46,
      196, 254, 178, 195, 144, 227, 190, 179, 172, 75, 128, 107, 153, 219, 244,
      33, 86, 15, 55, 207, 43, 94, 31, 188, 101, 125, 142, 251, 62, 246, 167,
      11, 112, 13, 44, 15, 90, 10, 145, 12, 141, 13, 235, 137, 160, 34, 121,
      30, 110, 138, 194, 70, 123, 196, 180, 197, 50, 28, 141, 138, 123, 158,
      32, 7, 71, 227, 70, 146, 115, 114, 71, 170, 192, 137, 156, 180, 189, 244,
      176, 83, 115, 25, 78, 153, 35, 217, 102, 103, 250, 115, 116, 114, 91,
      242, 248, 207, 103, 229, 127, 42, 48, 186, 88, 94, 248, 179, 200, 161,
      248, 214, 101, 170, 210, 136, 178, 209, 114, 133, 138, 146, 171, 24, 120,
      221, 121, 95, 227, 81, 59, 83, 239, 217, 176, 116, 35, 250, 38, 242, 86,
      193, 109, 177, 59, 15, 91, 14, 181, 254, 188, 91, 116, 79, 253, 254, 219,
      206, 212, 46, 254, 238, 158, 135, 135, 122, 55, 30, 101, 15, 240, 61,
      190, 63, 232, 252, 116, 115, 168, 112, 68, 125, 116, 254, 121, 230, 11,
      5, 120, 167, 169, 152, 34, 205, 56, 189, 241, 154, 205, 154, 31, 93, 20,
      90, 74, 95, 94, 94, 177, 250, 220, 246, 149, 255, 91, 254, 15, 236, 86,
      210, 207, 157, 189, 132, 223, 235, 7, 22, 208, 0, 118, 152, 105, 80, 0,
      122, 192, 6, 102, 65, 14, 131, 84, 152, 75, 168, 129, 249, 131, 81, 240,
      1, 246, 62, 11, 36, 7, 89, 67, 17, 80, 46, 212, 4, 77, 66, 187, 8, 62,
      184, 206, 143, 70, 148, 33, 158, 34, 118, 224, 42, 222, 7, 89, 140, 156,
      68, 49, 162, 156, 80, 197, 168, 121, 180, 40, 250, 8, 186, 23, 195, 128,
      9, 196, 116, 98, 153, 176, 145, 216, 97, 156, 36, 238, 44, 110, 141, 204,
      158, 172, 157, 156, 143, 60, 135, 252, 23, 62, 2, 191, 64, 112, 35, 188,
      160, 176, 165, 24, 163, 116, 160, 156, 166, 242, 165, 90, 163, 78, 162,
      161, 165, 169, 161, 213, 161, 125, 77, 119, 140, 158, 155, 190, 159, 225,
      48, 35, 39, 227, 48, 211, 9, 102, 85, 230, 117, 150, 122, 86, 31, 54,
      118, 182, 9, 246, 243, 28, 182, 156, 244, 240, 58, 85, 201, 77, 226, 209,
      230, 165, 227, 93, 230, 235, 225, 47, 21, 136, 23, 116, 16, 146, 18, 38,
      19, 158, 23, 233, 20, 45, 17, 59, 38, 238, 37, 97, 36, 41, 35, 197, 41,
      77, 41, 3, 201, 252, 144, 93, 149, 123, 39, 63, 165, 48, 164, 216, 173,
      116, 71, 185, 90, 229, 178, 234, 5, 181, 92, 245, 179, 26, 57, 154, 121,
      90, 133, 218, 229, 58, 215, 117, 59, 244, 198, 244, 87, 13, 41, 141, 20,
      140, 189, 77, 206, 155, 14, 152, 3, 11, 117, 203, 120, 171, 14, 27, 132,
      173, 153, 93, 129, 253, 59, 71, 57, 167, 20, 231, 65, 87, 26, 55, 123,
      247, 130, 67, 47, 61, 217, 188, 188, 137, 245, 222, 155, 190, 134, 126,
      133, 254, 171, 129, 6, 65, 165, 193, 219, 161, 118, 97, 13, 17, 8, 146,
      227, 225, 186, 200, 253, 104, 167, 152, 155, 177, 132, 163, 161, 113, 67,
      9, 178, 137, 69, 199, 209, 73, 145, 201, 179, 169, 86, 39, 58, 79, 74,
      164, 151, 156, 198, 103, 36, 102, 126, 201, 246, 61, 51, 147, 227, 152,
      251, 60, 207, 246, 252, 248, 5, 199, 130, 87, 133, 46, 151, 198, 139,
      141, 75, 110, 151, 50, 150, 69, 95, 25, 169, 16, 171, 60, 117, 117, 177,
      74, 191, 186, 170, 150, 172, 46, 162, 126, 242, 186, 206, 141, 198, 155,
      220, 183, 46, 220, 166, 190, 115, 182, 133, 166, 181, 224, 46, 87, 123,
      237, 125, 197, 142, 190, 7, 78, 93, 31, 123, 146, 122, 25, 251, 26, 250,
      117, 6, 198, 158, 120, 13, 126, 120, 22, 60, 244, 113, 36, 112, 116, 233,
      185, 255, 248, 210, 68, 208, 228, 231, 87, 49, 83, 191, 102, 50, 223,
      176, 189, 189, 61, 231, 184, 128, 121, 215, 251, 62, 247, 67, 208, 71,
      243, 21, 197, 207, 124, 107, 244, 235, 184, 111, 251, 27, 91, 155, 223,
      183, 191, 237, 108, 236, 109, 255, 246, 63, 14, 208, 1, 110, 32, 9, 255,
      253, 22, 48, 179, 20, 241, 219, 251, 117, 240, 191, 255, 2, 172, 66, 104,
      152, 33, 82, 133, 28, 97, 54, 40, 31, 106, 129, 94, 194, 222, 231, 70,
      24, 34, 194, 16, 23, 16, 15, 224, 92, 147, 21, 105, 134, 76, 70, 182, 33,
      191, 161, 100, 81, 145, 48, 39, 179, 131, 214, 67, 159, 65, 79, 97, 68,
      49, 137, 152, 17, 172, 48, 54, 5, 251, 26, 167, 134, 43, 198, 237, 146,
      121, 145, 245, 145, 75, 146, 95, 194, 99, 241, 71, 241, 43, 4, 111, 194,
      12, 133, 51, 197, 36, 165, 43, 229, 44, 85, 16, 213, 6, 245, 73, 26, 22,
      154, 155, 180, 166, 180, 75, 116, 167, 233, 37, 232, 199, 25, 146, 25,
      165, 24, 231, 152, 10, 153, 109, 88, 8, 44, 3, 172, 105, 108, 58, 108,
      251, 236, 93, 28, 105, 156, 230, 92, 76, 92, 139, 220, 173, 60, 217, 188,
      126, 124, 58, 252, 60, 2, 72, 129, 247, 130, 3, 66, 117, 194, 89, 34,
      161, 162, 214, 98, 74, 226, 60, 18, 148, 18, 191, 36, 215, 225, 76, 101,
      65, 102, 86, 118, 86, 110, 78, 126, 65, 225, 157, 226, 188, 210, 172,
      242, 107, 149, 105, 213, 25, 181, 89, 245, 37, 141, 53, 205, 61, 109,
      130, 14, 151, 174, 130, 158, 133, 126, 176, 193, 25, 195, 102, 163, 247,
      38, 28, 166, 46, 102, 197, 230, 179, 150, 34, 86, 49, 214, 125, 182, 44,
      118, 36, 251, 65, 71, 17, 167, 44, 231, 85, 87, 43, 183, 134, 67, 40, 15,
      103, 207, 58, 175, 61, 111, 59, 159, 6, 63, 156, 127, 64, 192, 147, 32,
      233, 224, 162, 80, 76, 88, 116, 248, 59, 146, 237, 225, 206, 40, 161,
      232, 51, 49, 235, 177, 206, 71, 187, 226, 69, 19, 46, 30, 195, 30, 143,
      75, 90, 77, 241, 75, 125, 155, 230, 118, 114, 234, 148, 203, 233, 151,
      153, 78, 89, 19, 103, 28, 207, 190, 204, 117, 63, 55, 15, 231, 157, 63,
      10, 210, 10, 233, 47, 85, 23, 171, 151, 140, 150, 250, 149, 125, 45, 143,
      170, 248, 116, 213, 237, 218, 163, 106, 201, 154, 252, 218, 221, 122,
      255, 134, 209, 27, 90, 141, 141, 183, 184, 155, 242, 239, 224, 155, 211,
      90, 65, 91, 114, 59, 242, 94, 102, 7, 67, 103, 69, 151, 76, 247, 195,
      135, 78, 189, 43, 143, 78, 12, 176, 63, 110, 29, 180, 123, 186, 58, 148,
      62, 194, 58, 122, 237, 185, 200, 120, 245, 4, 247, 100, 193, 43, 194, 84,
      202, 244, 214, 107, 210, 155, 229, 89, 223, 185, 183, 11, 174, 239, 38,
      223, 219, 45, 13, 47, 155, 125, 236, 95, 209, 91, 237, 250, 162, 177,
      118, 127, 93, 253, 91, 199, 134, 246, 143, 222, 45, 211, 237, 177, 29,
      183, 221, 197, 95, 145, 7, 254, 143, 242, 151, 147, 61, 216, 61, 0, 68,
      208, 133, 233, 199, 55, 251, 251, 223, 224, 125, 3, 155, 7, 192, 222,
      185, 253, 253, 157, 138, 253, 253, 189, 74, 184, 216, 152, 129, 185, 202,
      208, 63, 252, 246, 129, 50, 6, 102, 253, 75, 238, 31, 160, 71, 129, 225,
      201, 7, 215, 255, 110, 255, 15, 171, 68, 72, 235, 79, 40, 150, 30, 0, 0,
      0, 9, 112, 72, 89, 115, 0, 0, 11, 19, 0, 0, 11, 19, 1, 0, 154, 156, 24,
      0, 0, 5, 107, 73, 68, 65, 84, 120, 1, 237, 156, 233, 117, 220, 48, 12,
      132, 179, 121, 233, 192, 21, 186, 7, 151, 225, 30, 92, 161, 107, 112, 38,
      153, 183, 99, 24, 16, 47, 29, 20, 119, 69, 255, 80, 64, 16, 4, 193, 79,
      67, 74, 235, 35, 183, 207, 207, 207, 95, 243, 171, 142, 192, 239, 186,
      176, 25, 245, 143, 192, 132, 213, 160, 131, 9, 107, 194, 106, 32, 208,
      16, 58, 149, 53, 97, 53, 16, 104, 8, 157, 202, 122, 40, 88, 111, 111,
      111, 47, 47, 47, 184, 54, 84, 125, 82, 232, 237, 196, 151, 82, 0, 250,
      248, 248, 192, 194, 191, 190, 190, 110, 183, 27, 140, 215, 215, 215, 247,
      247, 247, 147, 80, 148, 167, 61, 7, 150, 195, 68, 88, 227, 35, 235, 13,
      203, 97, 162, 172, 120, 79, 41, 174, 145, 145, 245, 62, 224, 177, 239,
      128, 67, 138, 199, 190, 35, 35, 92, 97, 203, 143, 24, 238, 80, 121, 70,
      48, 122, 195, 34, 29, 203, 43, 82, 64, 175, 99, 23, 99, 78, 241, 252, 57,
      101, 86, 76, 10, 28, 132, 162, 2, 40, 58, 250, 229, 28, 202, 232, 173,
      44, 17, 145, 196, 168, 50, 92, 241, 69, 65, 145, 215, 220, 134, 94, 40,
      224, 34, 151, 181, 229, 28, 202, 232, 189, 13, 37, 40, 202, 7, 44, 104,
      196, 166, 61, 239, 7, 65, 214, 27, 150, 150, 205, 77, 167, 38, 169, 225,
      10, 191, 117, 14, 101, 159, 118, 102, 145, 130, 149, 143, 108, 170, 108,
      192, 51, 171, 183, 178, 184, 13, 165, 23, 158, 247, 104, 58, 161, 129,
      151, 216, 41, 248, 116, 163, 247, 27, 60, 23, 236, 222, 227, 73, 74, 188,
      128, 105, 204, 79, 136, 107, 182, 33, 150, 186, 241, 251, 4, 96, 129, 15,
      240, 78, 101, 84, 19, 252, 99, 146, 194, 109, 110, 83, 150, 83, 4, 198,
      111, 87, 1, 115, 110, 207, 211, 97, 147, 214, 194, 114, 152, 30, 101,
      227, 236, 75, 176, 12, 203, 97, 194, 244, 32, 197, 34, 176, 113, 216,
      164, 241, 16, 234, 216, 130, 175, 124, 102, 233, 129, 197, 105, 116, 208,
      184, 7, 22, 8, 14, 248, 176, 223, 130, 38, 142, 45, 195, 34, 29, 169, 41,
      166, 128, 135, 187, 18, 145, 139, 189, 79, 227, 108, 120, 207, 130, 148,
      8, 69, 139, 167, 232, 232, 151, 243, 137, 141, 178, 178, 68, 68, 18, 163,
      202, 112, 197, 23, 55, 35, 121, 205, 109, 232, 133, 2, 46, 114, 89, 91,
      206, 39, 54, 202, 219, 80, 130, 162, 124, 192, 130, 70, 108, 206, 51,
      235, 91, 40, 220, 116, 223, 237, 255, 212, 208, 132, 223, 58, 159, 216,
      110, 56, 179, 72, 193, 202, 71, 54, 85, 246, 244, 103, 86, 237, 54, 148,
      94, 120, 222, 163, 233, 132, 6, 94, 98, 167, 96, 24, 248, 20, 105, 155,
      43, 108, 254, 24, 120, 75, 158, 189, 126, 144, 92, 86, 150, 251, 208, 43,
      70, 246, 204, 2, 166, 145, 63, 0, 175, 184, 67, 139, 67, 202, 31, 119,
      236, 176, 248, 209, 7, 152, 82, 223, 36, 176, 90, 88, 119, 174, 225, 126,
      216, 217, 97, 183, 230, 177, 25, 182, 235, 171, 172, 44, 91, 174, 85,
      217, 69, 212, 100, 151, 223, 166, 44, 59, 178, 104, 83, 89, 173, 90, 136,
      105, 169, 142, 45, 121, 152, 161, 183, 178, 226, 74, 46, 229, 105, 219,
      134, 151, 66, 19, 23, 59, 97, 69, 38, 73, 207, 132, 149, 68, 19, 59, 38,
      172, 200, 36, 233, 41, 191, 193, 39, 135, 246, 237, 176, 111, 76, 235,
      102, 182, 239, 125, 249, 12, 169, 231, 230, 84, 86, 158, 219, 143, 222,
      7, 80, 214, 150, 55, 172, 31, 107, 173, 104, 80, 191, 212, 96, 212, 215,
      84, 86, 5, 194, 123, 200, 64, 176, 112, 87, 121, 99, 239, 181, 109, 250,
      119, 93, 54, 168, 56, 35, 228, 129, 96, 109, 98, 211, 101, 240, 16, 103,
      22, 5, 197, 91, 106, 237, 117, 4, 108, 6, 107, 175, 203, 102, 71, 77,
      101, 89, 26, 5, 251, 100, 101, 217, 59, 159, 178, 11, 43, 48, 221, 169,
      12, 214, 111, 194, 155, 205, 169, 172, 6, 100, 39, 43, 43, 158, 83, 91,
      84, 176, 111, 182, 72, 113, 42, 43, 50, 73, 122, 78, 86, 22, 235, 138,
      138, 72, 214, 91, 209, 177, 111, 54, 59, 225, 84, 150, 165, 81, 176, 135,
      80, 22, 107, 164, 34, 10, 245, 86, 119, 239, 155, 141, 211, 78, 101, 85,
      227, 127, 136, 255, 49, 4, 207, 71, 62, 34, 221, 178, 82, 126, 23, 182,
      99, 115, 42, 171, 1, 230, 64, 103, 86, 170, 106, 251, 116, 179, 49, 71,
      156, 74, 54, 127, 180, 167, 178, 34, 147, 164, 231, 1, 148, 197, 218,
      251, 235, 40, 50, 155, 202, 138, 76, 146, 158, 9, 43, 137, 38, 118, 76,
      88, 145, 73, 210, 51, 208, 153, 181, 248, 50, 149, 44, 188, 162, 99, 247,
      99, 110, 42, 171, 130, 250, 61, 100, 8, 101, 81, 83, 86, 8, 187, 120, 98,
      146, 251, 170, 87, 254, 59, 149, 213, 0, 110, 194, 106, 128, 53, 196, 54,
      100, 189, 241, 128, 223, 203, 211, 192, 35, 27, 58, 149, 149, 197, 243,
      179, 115, 32, 101, 241, 128, 119, 167, 178, 107, 162, 248, 162, 71, 1,
      52, 126, 174, 119, 83, 235, 112, 88, 170, 216, 62, 236, 54, 149, 124,
      222, 224, 163, 96, 197, 223, 28, 203, 80, 179, 154, 34, 10, 5, 47, 54,
      225, 116, 1, 209, 131, 0, 221, 158, 24, 140, 120, 245, 114, 138, 154,
      107, 143, 51, 203, 149, 133, 210, 23, 171, 175, 41, 183, 53, 38, 51, 87,
      166, 43, 53, 203, 81, 202, 226, 124, 194, 36, 67, 152, 100, 196, 202, 20,
      28, 187, 86, 123, 108, 206, 204, 212, 249, 252, 61, 148, 101, 43, 176,
      69, 91, 191, 181, 87, 47, 198, 37, 81, 30, 55, 41, 154, 242, 40, 198,
      142, 77, 217, 199, 42, 107, 113, 86, 21, 186, 216, 203, 234, 155, 214,
      128, 60, 46, 167, 29, 238, 186, 52, 41, 252, 54, 76, 254, 140, 113, 136,
      178, 226, 233, 158, 169, 192, 117, 165, 214, 230, 194, 92, 211, 46, 219,
      218, 173, 217, 48, 214, 14, 247, 179, 196, 95, 51, 117, 17, 173, 77, 145,
      106, 45, 180, 117, 34, 198, 103, 214, 102, 19, 46, 22, 83, 51, 214, 242,
      217, 89, 89, 34, 101, 11, 61, 212, 94, 164, 16, 103, 252, 39, 152, 85,
      127, 189, 104, 87, 116, 212, 153, 85, 185, 134, 184, 170, 21, 158, 226,
      92, 17, 83, 156, 69, 73, 98, 48, 121, 65, 98, 59, 43, 139, 69, 104, 226,
      88, 211, 41, 158, 154, 122, 196, 8, 193, 250, 114, 213, 30, 162, 44, 76,
      140, 249, 220, 76, 108, 170, 38, 215, 155, 138, 119, 97, 187, 55, 49,
      111, 170, 36, 204, 197, 170, 24, 0, 125, 237, 172, 44, 29, 135, 177, 2,
      120, 162, 83, 139, 207, 247, 42, 140, 6, 131, 139, 87, 55, 10, 205, 197,
      2, 116, 159, 148, 48, 14, 164, 231, 16, 101, 49, 245, 98, 101, 236, 18,
      83, 52, 237, 9, 154, 25, 194, 129, 77, 215, 213, 217, 22, 7, 162, 230,
      163, 254, 70, 218, 34, 208, 10, 45, 35, 57, 101, 44, 14, 81, 175, 51,
      242, 169, 16, 156, 202, 38, 29, 185, 132, 139, 128, 108, 204, 129, 176,
      236, 52, 35, 216, 98, 87, 132, 149, 185, 13, 59, 159, 89, 35, 112, 89,
      172, 65, 8, 82, 10, 74, 65, 180, 217, 174, 2, 11, 107, 22, 47, 187, 126,
      217, 41, 136, 10, 128, 113, 224, 1, 111, 167, 25, 202, 118, 92, 106, 52,
      197, 250, 47, 164, 172, 212, 13, 179, 236, 242, 234, 187, 22, 172, 20,
      11, 203, 43, 197, 20, 254, 107, 193, 114, 32, 82, 236, 92, 152, 154, 71,
      189, 103, 105, 130, 1, 13, 190, 70, 180, 146, 194, 66, 174, 8, 107, 245,
      253, 251, 11, 60, 127, 209, 30, 193, 102, 148, 251, 0, 0, 0, 0, 73, 69,
      78, 68, 174, 66, 96, 130];
  for(i = b.length; i--;)
    assertEquals(exp[i], b[i]);
  b = new Buffer('abcdefg0123456日本!"#$%&', 'ucs2');
  exp = [97, 0, 98, 0, 99, 0, 100, 0, 101, 0, 102, 0, 103, 0, 48, 0, 49, 0, 50,
      0, 51, 0, 52, 0, 53, 0, 54, 0, 229, 101, 44, 103, 33, 0, 34, 0, 35, 0,
      36, 0, 37, 0, 38, 0];
  for(i = b.length; i--;)
    assertEquals(exp[i], b[i]);

  var arr = [1, 10, 100, 1000, 10000];
  b = Buffer(arr);
  for(i = b.length; i--;)
    assertEquals(arr[i] & 0xFF, b[i]);
}


function assert(ac) {
  assertEquals(true, ac);
}
function assertFalse(ac) {
  assertEquals(false, ac);
}

function assertEquals(ex, ac) {
  if(ex !== ac)
    fail('<expected> ' + ex + '  but <actual> ' + ac);
  console.log('ok');
}

function assertThrows(fnc, thisarg, args) {
  try {
    fnc.apply(thisarg, args);
  } catch(err) {
    console.log('ok');
    return err;
  }
  fail('<expected> throws error  but <actual> successfully executed');
}

function fail(str) {
  console.error(str ? str: 'failed');
}
