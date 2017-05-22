var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
 if (Module["ENVIRONMENT"] === "WEB") {
  ENVIRONMENT_IS_WEB = true;
 } else if (Module["ENVIRONMENT"] === "WORKER") {
  ENVIRONMENT_IS_WORKER = true;
 } else if (Module["ENVIRONMENT"] === "NODE") {
  ENVIRONMENT_IS_NODE = true;
 } else if (Module["ENVIRONMENT"] === "SHELL") {
  ENVIRONMENT_IS_SHELL = true;
 } else {
  throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
 }
} else {
 ENVIRONMENT_IS_WEB = typeof window === "object";
 ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
 ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
 ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = console.log;
 if (!Module["printErr"]) Module["printErr"] = console.warn;
 var nodeFS;
 var nodePath;
 Module["read"] = function shell_read(filename, binary) {
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  return binary ? ret : ret.toString();
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function shell_read() {
   throw "no read() available";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof quit === "function") {
  Module["quit"] = (function(status, toThrow) {
   quit(status);
  });
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function shell_read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (ENVIRONMENT_IS_WORKER) {
  Module["readBinary"] = function readBinary(url) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.responseType = "arraybuffer";
   xhr.send(null);
   return xhr.response;
  };
 }
 Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
   } else {
    onerror();
   }
  };
  xhr.onerror = onerror;
  xhr.send(null);
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function shell_print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function shell_printErr(x) {
   console.warn(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
if (!Module["quit"]) {
 Module["quit"] = (function(status, toThrow) {
  throw toThrow;
 });
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
moduleOverrides = undefined;
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
  return value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   assert(args.length == sig.length - 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
  } else {
   assert(sig.length == 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   if (sig.length === 1) {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func);
    };
   } else if (sig.length === 2) {
    sigCache[func] = function dynCall_wrapper(arg) {
     return Runtime.dynCall(sig, func, [ arg ]);
    };
   } else {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
    };
   }
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  assert((STACKTOP | 0) < (STACK_MAX | 0) | 0) | 0;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + (assert(!staticSealed), size) | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15 | 0) & -16;
  HEAP32[DYNAMICTOP_PTR >> 2] = end;
  if (end >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    HEAP32[DYNAMICTOP_PTR >> 2] = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = 0;
var EXITSTATUS = 0;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    var len = (str.length << 2) + 1;
    ret = Runtime.stackAlloc(len);
    stringToUTF8(str, ret, len);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if ((!opts || !opts.async) && typeof EmterpreterAsync === "object") {
   assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall");
  }
  if (opts && opts.async) assert(!returnType, "async ccalls cannot return values");
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = null;
 function ensureJSsource() {
  if (!JSsource) {
   JSsource = {};
   for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
     JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
   }
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   ensureJSsource();
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=(" + convertCode.returnValue + ");";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
  if (!numericArgs) {
   ensureJSsource();
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  assert(type, "Must know what type to store in allocate!");
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  assert(ptr + i < TOTAL_MEMORY);
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx) {
 var endPtr = idx;
 while (u8Array[endPtr]) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var u0, u1, u2, u3, u4, u5;
  var str = "";
  while (1) {
   u0 = u8Array[idx++];
   if (!u0) return str;
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u3 = u8Array[idx++] & 63;
    if ((u0 & 248) == 240) {
     u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
    } else {
     u4 = u8Array[idx++] & 63;
     if ((u0 & 252) == 248) {
      u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
     } else {
      u5 = u8Array[idx++] & 63;
      u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
     }
    }
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function demangle(func) {
 var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
 if (__cxa_demangle_func) {
  try {
   var s = func.substr(1);
   var len = lengthBytesUTF8(s) + 1;
   var buf = _malloc(len);
   stringToUTF8(s, buf, len);
   var status = _malloc(4);
   var ret = __cxa_demangle_func(buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
  return func;
 }
 Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 return func;
}
function demangleAll(text) {
 var regex = /__Z[\w\d_]+/g;
 return text.replace(regex, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}
Module["stackTrace"] = stackTrace;
var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function writeStackCookie() {
 assert((STACK_MAX & 3) == 0);
 HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
 HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
}
function checkStackCookie() {
 if (HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 || HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022) {
  abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16));
 }
 if (HEAP32[0] !== 1668509029) throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
}
function abortStackOverflow(allocSize) {
 abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - Module["asm"].stackSave() + allocSize) + " bytes available!");
}
function abortOnCannotGrowMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
 abortOnCannotGrowMemory();
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["buffer"]) {
 buffer = Module["buffer"];
 assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength);
} else {
 {
  buffer = new ArrayBuffer(TOTAL_MEMORY);
 }
 assert(buffer.byteLength === TOTAL_MEMORY);
}
updateGlobalBufferViews();
function getTotalMemory() {
 return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw "Runtime error: expected the system to be little-endian!";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 checkStackCookie();
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 checkStackCookie();
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 checkStackCookie();
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 checkStackCookie();
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
 var lastChar, end;
 if (dontAddNull) {
  end = buffer + lengthBytesUTF8(string);
  lastChar = HEAP8[end];
 }
 stringToUTF8(string, buffer, Infinity);
 if (dontAddNull) HEAP8[end] = lastChar;
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer);
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
if (!Math["trunc"]) Math["trunc"] = (function(x) {
 return x < 0 ? Math.ceil(x) : Math.floor(x);
});
Math.trunc = Math["trunc"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
   runDependencyWatcher = setInterval((function() {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      Module.printErr("still waiting on run dependencies:");
     }
     Module.printErr("dependency: " + dep);
    }
    if (shown) {
     Module.printErr("(end of list)");
    }
   }), 1e4);
  }
 } else {
  Module.printErr("warning: run dependency added without ID");
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  Module.printErr("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var FS = {
 error: (function() {
  abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1");
 }),
 init: (function() {
  FS.error();
 }),
 createDataFile: (function() {
  FS.error();
 }),
 createPreloadedFile: (function() {
  FS.error();
 }),
 createLazyFile: (function() {
  FS.error();
 }),
 open: (function() {
  FS.error();
 }),
 mkdev: (function() {
  FS.error();
 }),
 registerDevice: (function() {
  FS.error();
 }),
 analyzePath: (function() {
  FS.error();
 }),
 loadFilesFromDB: (function() {
  FS.error();
 }),
 ErrnoError: function ErrnoError() {
  FS.error();
 }
};
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
var ASM_CONSTS = [ (function($0) {
 {
  const context = new AudioContext;
  window.oscillator = context.createOscillator();
  window.oscillator.frequency.value = $0;
  window.oscillator.connect(context.destination);
  window.oscillator.start(0);
 }
}), (function($0) {
 {
  window.oscillator.frequency.value = $0;
 }
}), (function() {
 {
  window.oscillator.stop(0);
 }
}) ];
function _emscripten_asm_const_ii(code, a0) {
 return ASM_CONSTS[code](a0);
}
function _emscripten_asm_const_v(code) {
 return ASM_CONSTS[code]();
}
STATIC_BASE = Runtime.GLOBAL_BASE;
STATICTOP = STATIC_BASE + 2272;
__ATINIT__.push();
allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 188, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 216, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 252, 0, 0, 0, 123, 32, 99, 111, 110, 115, 116, 32, 99, 111, 110, 116, 101, 120, 116, 32, 61, 32, 110, 101, 119, 32, 65, 117, 100, 105, 111, 67, 111, 110, 116, 101, 120, 116, 59, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 32, 61, 32, 99, 111, 110, 116, 101, 120, 116, 46, 99, 114, 101, 97, 116, 101, 79, 115, 99, 105, 108, 108, 97, 116, 111, 114, 40, 41, 59, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 46, 102, 114, 101, 113, 117, 101, 110, 99, 121, 46, 118, 97, 108, 117, 101, 32, 61, 32, 36, 48, 59, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 46, 99, 111, 110, 110, 101, 99, 116, 40, 99, 111, 110, 116, 101, 120, 116, 46, 100, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 41, 59, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 46, 115, 116, 97, 114, 116, 40, 48, 41, 59, 32, 125, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 46, 102, 114, 101, 113, 117, 101, 110, 99, 121, 46, 118, 97, 108, 117, 101, 32, 61, 32, 36, 48, 59, 32, 125, 0, 123, 32, 119, 105, 110, 100, 111, 119, 46, 111, 115, 99, 105, 108, 108, 97, 116, 111, 114, 46, 115, 116, 111, 112, 40, 48, 41, 59, 32, 125, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
var EMTSTACKTOP = getMemory(1048576);
var EMT_STACK_MAX = EMTSTACKTOP + 1048576;
var eb = getMemory(2392);
assert(eb % 8 === 0);
__ATPRERUN__.push((function() {
 HEAPU8.set([ 140, 3, 69, 0, 0, 0, 0, 0, 2, 66, 0, 0, 146, 0, 0, 0, 1, 64, 0, 0, 136, 67, 0, 0, 0, 65, 67, 0, 136, 67, 0, 0, 25, 67, 67, 48, 137, 67, 0, 0, 130, 67, 0, 0, 136, 68, 0, 0, 49, 67, 67, 68, 68, 0, 0, 0, 1, 68, 48, 0, 135, 67, 0, 0, 68, 0, 0, 0, 25, 59, 65, 16, 0, 58, 65, 0, 25, 30, 65, 32, 25, 41, 0, 28, 82, 52, 41, 0, 85, 30, 52, 0, 25, 54, 30, 4, 25, 55, 0, 20, 82, 56, 55, 0, 4, 57, 56, 52, 85, 54, 57, 0, 25, 10, 30, 8, 85, 10, 1, 0, 25, 11, 30, 12, 85, 11, 2, 0, 3, 12, 57, 2, 25, 13, 0, 60, 82, 14, 13, 0, 0, 15, 30, 0, 85, 58, 14, 0, 25, 60, 58, 4, 85, 60, 15, 0, 25, 61, 58, 8, 1, 67, 2, 0, 85, 61, 67, 0, 135, 16, 1, 0, 66, 58, 0, 0, 134, 17, 0, 0, 180, 7, 0, 0, 16, 0, 0, 0, 13, 18, 12, 17, 121, 18, 3, 0, 1, 64, 3, 0, 119, 0, 69, 0, 1, 4, 2, 0, 0, 5, 12, 0, 0, 6, 30, 0, 0, 26, 17, 0, 34, 25, 26, 0, 120, 25, 44, 0, 4, 35, 5, 26, 25, 36, 6, 4, 82, 37, 36, 0, 16, 38, 37, 26, 25, 39, 6, 8, 125, 9, 38, 39, 6, 0, 0, 0, 41, 67, 38, 31, 42, 67, 67, 31, 0, 40, 67, 0, 3, 8, 40, 4, 1, 67, 0, 0, 125, 42, 38, 37, 67, 0, 0, 0, 4, 3, 26, 42, 82, 43, 9, 0, 3, 44, 43, 3, 85, 9, 44, 0, 25, 45, 9, 4, 82, 46, 45, 0, 4, 47, 46, 3, 85, 45, 47, 0, 82, 48, 13, 0, 0, 49, 9, 0, 85, 59, 48, 0, 25, 62, 59, 4, 85, 62, 49, 0, 25, 63, 59, 8, 85, 63, 8, 0, 135, 50, 1, 0, 66, 59, 0, 0, 134, 51, 0, 0, 180, 7, 0, 0, 50, 0, 0, 0, 13, 53, 35, 51, 121, 53, 3, 0, 1, 64, 3, 0, 119, 0, 25, 0, 0, 4, 8, 0, 0, 5, 35, 0, 0, 6, 9, 0, 0, 26, 51, 0, 119, 0, 212, 255, 25, 27, 0, 16, 1, 67, 0, 0, 85, 27, 67, 0, 1, 67, 0, 0, 85, 41, 67, 0, 1, 67, 0, 0, 85, 55, 67, 0, 82, 28, 0, 0, 39, 67, 28, 32, 0, 29, 67, 0, 85, 0, 29, 0, 32, 31, 4, 2, 121, 31, 3, 0, 1, 7, 0, 0, 119, 0, 5, 0, 25, 32, 6, 4, 82, 33, 32, 0, 4, 34, 2, 33, 0, 7, 34, 0, 32, 67, 64, 3, 121, 67, 11, 0, 25, 19, 0, 44, 82, 20, 19, 0, 25, 21, 0, 48, 82, 22, 21, 0, 3, 23, 20, 22, 25, 24, 0, 16, 85, 24, 23, 0, 85, 41, 20, 0, 85, 55, 20, 0, 0, 7, 2, 0, 137, 65, 0, 0, 139, 7, 0, 0, 140, 1, 41, 0, 0, 0, 0, 0, 1, 38, 0, 0, 136, 40, 0, 0, 0, 39, 40, 0, 1, 40, 0, 0, 13, 8, 0, 40, 121, 8, 68, 0, 1, 40, 120, 1, 82, 35, 40, 0, 1, 40, 0, 0, 13, 36, 35, 40, 121, 36, 3, 0, 1, 29, 0, 0, 119, 0, 7, 0, 1, 40, 120, 1, 82, 9, 40, 0, 134, 10, 0, 0, 20, 2, 0, 0, 9, 0, 0, 0, 0, 29, 10, 0, 134, 11, 0, 0, 80, 8, 0, 0, 82, 3, 11, 0, 1, 40, 0, 0, 13, 12, 3, 40, 121, 12, 3, 0, 0, 5, 29, 0, 119, 0, 43, 0, 0, 4, 3, 0, 0, 6, 29, 0, 25, 13, 4, 76, 82, 14, 13, 0, 1, 40, 255, 255, 15, 15, 40, 14, 121, 15, 6, 0, 134, 16, 0, 0, 232, 8, 0, 0, 4, 0, 0, 0, 0, 26, 16, 0, 119, 0, 2, 0, 1, 26, 0, 0, 25, 17, 4, 20, 82, 18, 17, 0, 25, 20, 4, 28, 82, 21, 20, 0, 16, 22, 21, 18, 121, 22, 8, 0, 134, 23, 0, 0, 164, 3, 0, 0, 4, 0, 0, 0, 20, 40, 23, 6, 0, 24, 40, 0, 0, 7, 24, 0, 119, 0, 2, 0, 0, 7, 6, 0, 32, 25, 26, 0, 120, 25, 4, 0, 134, 40, 0, 0, 208, 8, 0, 0, 4, 0, 0, 0, 25, 27, 4, 56, 82, 2, 27, 0, 1, 40, 0, 0, 13, 28, 2, 40, 121, 28, 3, 0, 0, 5, 7, 0, 119, 0, 4, 0, 0, 4, 2, 0, 0, 6, 7, 0, 119, 0, 217, 255, 134, 40, 0, 0, 148, 8, 0, 0, 0, 1, 5, 0, 119, 0, 25, 0, 25, 19, 0, 76, 82, 30, 19, 0, 1, 40, 255, 255, 15, 31, 40, 30, 120, 31, 6, 0, 134, 32, 0, 0, 164, 3, 0, 0, 0, 0, 0, 0, 0, 1, 32, 0, 119, 0, 15, 0, 134, 33, 0, 0, 232, 8, 0, 0, 0, 0, 0, 0, 32, 37, 33, 0, 134, 34, 0, 0, 164, 3, 0, 0, 0, 0, 0, 0, 121, 37, 3, 0, 0, 1, 34, 0, 119, 0, 5, 0, 134, 40, 0, 0, 208, 8, 0, 0, 0, 0, 0, 0, 0, 1, 34, 0, 139, 1, 0, 0, 140, 1, 28, 0, 0, 0, 0, 0, 1, 22, 0, 0, 136, 24, 0, 0, 0, 23, 24, 0, 25, 2, 0, 20, 82, 13, 2, 0, 25, 15, 0, 28, 82, 16, 15, 0, 16, 17, 16, 13, 121, 17, 16, 0, 25, 18, 0, 36, 82, 19, 18, 0, 38, 25, 19, 7, 1, 26, 0, 0, 1, 27, 0, 0, 135, 24, 2, 0, 25, 0, 26, 27, 82, 20, 2, 0, 1, 24, 0, 0, 13, 21, 20, 24, 121, 21, 3, 0, 1, 1, 255, 255, 119, 0, 4, 0, 1, 22, 3, 0, 119, 0, 2, 0, 1, 22, 3, 0, 32, 24, 22, 3, 121, 24, 28, 0, 25, 3, 0, 4, 82, 4, 3, 0, 25, 5, 0, 8, 82, 6, 5, 0, 16, 7, 4, 6, 121, 7, 10, 0, 0, 8, 4, 0, 0, 9, 6, 0, 4, 10, 8, 9, 25, 11, 0, 40, 82, 12, 11, 0, 38, 25, 12, 7, 1, 27, 1, 0, 135, 24, 2, 0, 25, 0, 10, 27, 25, 14, 0, 16, 1, 24, 0, 0, 85, 14, 24, 0, 1, 24, 0, 0, 85, 15, 24, 0, 1, 24, 0, 0, 85, 2, 24, 0, 1, 24, 0, 0, 85, 5, 24, 0, 1, 24, 0, 0, 85, 3, 24, 0, 1, 1, 0, 0, 139, 1, 0, 0, 140, 3, 21, 0, 0, 0, 0, 0, 1, 17, 0, 0, 136, 19, 0, 0, 0, 18, 19, 0, 136, 19, 0, 0, 25, 19, 19, 32, 137, 19, 0, 0, 130, 19, 0, 0, 136, 20, 0, 0, 49, 19, 19, 20, 196, 4, 0, 0, 1, 20, 32, 0, 135, 19, 0, 0, 20, 0, 0, 0, 0, 12, 18, 0, 25, 5, 18, 20, 25, 6, 0, 60, 82, 7, 6, 0, 0, 8, 5, 0, 85, 12, 7, 0, 25, 13, 12, 4, 1, 19, 0, 0, 85, 13, 19, 0, 25, 14, 12, 8, 85, 14, 1, 0, 25, 15, 12, 12, 85, 15, 8, 0, 25, 16, 12, 16, 85, 16, 2, 0, 1, 19, 140, 0, 135, 9, 3, 0, 19, 12, 0, 0, 134, 10, 0, 0, 180, 7, 0, 0, 9, 0, 0, 0, 34, 11, 10, 0, 121, 11, 5, 0, 1, 19, 255, 255, 85, 5, 19, 0, 1, 4, 255, 255, 119, 0, 3, 0, 82, 3, 5, 0, 0, 4, 3, 0, 137, 18, 0, 0, 139, 4, 0, 0, 140, 3, 22, 0, 0, 0, 0, 0, 1, 18, 0, 0, 136, 20, 0, 0, 0, 19, 20, 0, 136, 20, 0, 0, 25, 20, 20, 32, 137, 20, 0, 0, 130, 20, 0, 0, 136, 21, 0, 0, 49, 20, 20, 21, 124, 5, 0, 0, 1, 21, 32, 0, 135, 20, 0, 0, 21, 0, 0, 0, 0, 15, 19, 0, 25, 8, 19, 16, 25, 9, 0, 36, 1, 20, 4, 0, 85, 9, 20, 0, 82, 10, 0, 0, 38, 20, 10, 64, 0, 11, 20, 0, 32, 12, 11, 0, 121, 12, 18, 0, 25, 13, 0, 60, 82, 14, 13, 0, 0, 3, 8, 0, 85, 15, 14, 0, 25, 16, 15, 4, 1, 20, 19, 84, 85, 16, 20, 0, 25, 17, 15, 8, 85, 17, 3, 0, 1, 20, 54, 0, 135, 4, 4, 0, 20, 15, 0, 0, 32, 5, 4, 0, 120, 5, 4, 0, 25, 6, 0, 75, 1, 20, 255, 255, 83, 6, 20, 0, 134, 7, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 137, 19, 0, 0, 139, 7, 0, 0, 140, 1, 7, 0, 0, 0, 0, 0, 25, 5, 0, 15, 38, 5, 5, 240, 0, 0, 5, 0, 130, 5, 1, 0, 82, 1, 5, 0, 3, 3, 1, 0, 1, 5, 0, 0, 15, 5, 5, 0, 15, 6, 3, 1, 19, 5, 5, 6, 34, 6, 3, 0, 20, 5, 5, 6, 121, 5, 7, 0, 135, 5, 5, 0, 1, 6, 12, 0, 135, 5, 6, 0, 6, 0, 0, 0, 1, 5, 255, 255, 139, 5, 0, 0, 130, 5, 1, 0, 85, 5, 3, 0, 135, 4, 7, 0, 47, 5, 4, 3, 140, 6, 0, 0, 135, 5, 8, 0, 32, 5, 5, 0, 121, 5, 8, 0, 1, 6, 12, 0, 135, 5, 6, 0, 6, 0, 0, 0, 130, 5, 1, 0, 85, 5, 1, 0, 1, 5, 255, 255, 139, 5, 0, 0, 139, 1, 0, 0, 140, 0, 14, 0, 0, 0, 0, 0, 1, 10, 0, 0, 136, 12, 0, 0, 0, 11, 12, 0, 136, 12, 0, 0, 25, 12, 12, 16, 137, 12, 0, 0, 130, 12, 0, 0, 136, 13, 0, 0, 49, 12, 12, 13, 204, 6, 0, 0, 1, 13, 16, 0, 135, 12, 0, 0, 13, 0, 0, 0, 1, 0, 0, 0, 1, 1, 200, 0, 0, 2, 1, 0, 1, 12, 0, 0, 135, 3, 9, 0, 12, 2, 0, 0, 0, 4, 1, 0, 1, 12, 208, 7, 15, 5, 4, 12, 120, 5, 2, 0, 119, 0, 12, 0, 0, 6, 1, 0, 1, 12, 1, 0, 135, 7, 9, 0, 12, 6, 0, 0, 1, 13, 10, 0, 135, 12, 10, 0, 13, 0, 0, 0, 0, 8, 1, 0, 25, 9, 8, 1, 0, 1, 9, 0, 119, 0, 241, 255, 1, 13, 2, 0, 135, 12, 11, 0, 13, 0, 0, 0, 137, 11, 0, 0, 1, 12, 0, 0, 139, 12, 0, 0, 140, 1, 11, 0, 0, 0, 0, 0, 1, 7, 0, 0, 136, 9, 0, 0, 0, 8, 9, 0, 136, 9, 0, 0, 25, 9, 9, 16, 137, 9, 0, 0, 130, 9, 0, 0, 136, 10, 0, 0, 49, 9, 9, 10, 120, 7, 0, 0, 1, 10, 16, 0, 135, 9, 0, 0, 10, 0, 0, 0, 0, 6, 8, 0, 25, 1, 0, 60, 82, 2, 1, 0, 134, 3, 0, 0, 184, 8, 0, 0, 2, 0, 0, 0, 85, 6, 3, 0, 1, 9, 6, 0, 135, 4, 12, 0, 9, 6, 0, 0, 134, 5, 0, 0, 180, 7, 0, 0, 4, 0, 0, 0, 137, 8, 0, 0, 139, 5, 0, 0, 140, 1, 8, 0, 0, 0, 0, 0, 1, 5, 0, 0, 136, 7, 0, 0, 0, 6, 7, 0, 1, 7, 0, 240, 16, 2, 7, 0, 121, 2, 8, 0, 1, 7, 0, 0, 4, 3, 7, 0, 134, 4, 0, 0, 248, 7, 0, 0, 85, 4, 3, 0, 1, 1, 255, 255, 119, 0, 2, 0, 0, 1, 0, 0, 139, 1, 0, 0, 140, 0, 5, 0, 0, 0, 0, 0, 1, 2, 0, 0, 136, 4, 0, 0, 0, 3, 4, 0, 134, 0, 0, 0, 48, 8, 0, 0, 25, 1, 0, 64, 139, 1, 0, 0, 140, 2, 2, 0, 0, 0, 0, 0, 137, 0, 0, 0, 132, 0, 0, 1, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 134, 0, 0, 0, 32, 9, 0, 0, 139, 0, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 212, 2, 135, 2, 13, 0, 3, 0, 0, 0, 1, 2, 220, 2, 139, 2, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 148, 2, 139, 2, 0, 0, 140, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 3, 212, 2, 135, 2, 14, 0, 3, 0, 0, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 139, 0, 0, 0, 140, 1, 4, 0, 0, 0, 0, 0, 1, 1, 0, 0, 136, 3, 0, 0, 0, 2, 3, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 3, 5, 0, 0, 0, 0, 0, 1, 4, 1, 0, 135, 3, 15, 0, 4, 0, 0, 0, 1, 3, 0, 0, 139, 3, 0, 0, 140, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 2, 0, 0, 0, 1, 2, 0, 1, 2, 8, 0, 139, 2, 0, 0, 140, 1, 3, 0, 0, 0, 0, 0, 1, 2, 0, 0, 135, 1, 16, 0, 2, 0, 0, 0, 1, 1, 0, 0, 139, 1, 0, 0 ], eb + 0);
 var relocations = [];
 relocations = relocations.concat([ 52, 1204, 1388, 1632, 1724, 1896, 180, 356, 604, 620, 680, 728, 768, 820, 856, 876, 892, 916, 1296, 1516, 1928, 1956, 2016, 2064, 2120 ]);
 for (var i = 0; i < relocations.length; i++) {
  assert(relocations[i] % 4 === 0);
  assert(relocations[i] >= 0 && relocations[i] < eb + 2392);
  assert(HEAPU32[eb + relocations[i] >> 2] + eb < -1 >>> 0, [ i, relocations[i] ]);
  HEAPU32[eb + relocations[i] >> 2] = HEAPU32[eb + relocations[i] >> 2] + eb;
 }
}));
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else Module.printErr("failed to set errno from JS");
 return value;
}
Module["_sbrk"] = _sbrk;
Module["_memset"] = _memset;
function ___lock() {}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
Module["_memcpy"] = _memcpy;
function _abort() {
 Module["abort"]();
}
function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (!window["setImmediate"]) {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   function Browser_setImmediate_messageHandler(event) {
    if (event.source === window && event.data === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   }
   window.addEventListener("message", Browser_setImmediate_messageHandler, true);
   window["setImmediate"] = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     window.postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else window.postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   window["setImmediate"](Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}
function _emscripten_get_now() {
 abort();
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = (function() {
   Module["dynCall_vi"](func, arg);
  });
 } else {
  browserIterationFunc = (function() {
   Module["dynCall_v"](func);
  });
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  checkStackCookie();
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}
var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: (function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  }),
  resume: (function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  }),
  updateStatus: (function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  }),
  runIter: (function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  })
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: (function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob;
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder;
    bb.append((new Uint8Array(byteArray)).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var img = new Image;
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio;
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    assert(typeof url == "string", "createObjectURL must return a url as a string");
    var audio = new Audio;
    audio.addEventListener("canplaythrough", (function() {
     finish(audio);
    }), false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout((function() {
     finish(audio);
    }), 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", (function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }), false);
   }
  }
 }),
 createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   contextHandle = GL.createContext(canvas, contextAttributes);
   if (contextHandle) {
    ctx = GL.getContext(contextHandle).GLctx;
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
    callback();
   }));
   Browser.init();
  }
  return ctx;
 }),
 destroyContext: (function(canvas, useWebGL, setInModule) {}),
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (function() {});
    canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize();
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
   Browser.updateCanvasDimensions(canvas);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? (function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null) || (canvasContainer["webkitRequestFullScreen"] ? (function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 }),
 requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
  Browser.requestFullScreen = (function(lockPointer, resizeCanvas, vrDevice) {
   return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
  });
  return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
 }),
 nextRAF: 0,
 fakeRequestAnimationFrame: (function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 }),
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: (function(func) {
  return (function() {
   if (!ABORT) return func.apply(null, arguments);
  });
 }),
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = false;
 }),
 resumeAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach((function(func) {
    func();
   }));
  }
 }),
 safeRequestAnimationFrame: (function(func) {
  return Browser.requestAnimationFrame((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }));
 }),
 safeSetTimeout: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }), timeout);
 }),
 safeSetInterval: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }), timeout);
 }),
 getMimetype: (function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 }),
 getUserMedia: (function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 }),
 getMovementX: (function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 }),
 getMovementY: (function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 }),
 getMouseWheelDelta: (function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;
  case "mousewheel":
   delta = event.wheelDelta;
   break;
  case "wheel":
   delta = event["deltaY"];
   break;
  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 }),
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: (function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 }),
 asyncLoad: (function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  Module["readAsync"](url, (function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }), (function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  }));
  if (dep) addRunDependency(dep);
 }),
 resizeListeners: [],
 updateResizeListeners: (function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach((function(listener) {
   listener(canvas.width, canvas.height);
  }));
 }),
 setCanvasSize: (function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 }),
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 setWindowedCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 updateCanvasDimensions: (function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }),
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: (function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 })
};
var EmterpreterAsync = {
 initted: false,
 state: 0,
 saveStack: "",
 yieldCallbacks: [],
 postAsync: null,
 asyncFinalizers: [],
 ensureInit: (function() {
  if (this.initted) return;
  this.initted = true;
  abortDecorators.push((function(output, what) {
   if (EmterpreterAsync.state !== 0) {
    return output + "\nThis error happened during an emterpreter-async save or load of the stack. Was there non-emterpreted code on the stack during save (which is unallowed)? You may want to adjust EMTERPRETIFY_BLACKLIST, EMTERPRETIFY_WHITELIST.\nThis is what the stack looked like when we tried to save it: " + [ EmterpreterAsync.state, EmterpreterAsync.saveStack ];
   }
   return output;
  }));
 }),
 setState: (function(s) {
  this.ensureInit();
  this.state = s;
  Module["asm"].setAsyncState(s);
 }),
 handle: (function(doAsyncOp, yieldDuring) {
  Module["noExitRuntime"] = true;
  if (EmterpreterAsync.state === 0) {
   var stack = new Int32Array(HEAP32.subarray(EMTSTACKTOP >> 2, Module["asm"].emtStackSave() >> 2));
   var stacktop = Module["asm"].stackSave();
   var resumedCallbacksForYield = false;
   function resumeCallbacksForYield() {
    if (resumedCallbacksForYield) return;
    resumedCallbacksForYield = true;
    EmterpreterAsync.yieldCallbacks.forEach((function(func) {
     func();
    }));
    Browser.resumeAsyncCallbacks();
   }
   var callingDoAsyncOp = 1;
   doAsyncOp(function resume(post) {
    if (callingDoAsyncOp) {
     assert(callingDoAsyncOp === 1);
     callingDoAsyncOp++;
     setTimeout((function() {
      resume(post);
     }), 0);
     return;
    }
    assert(EmterpreterAsync.state === 1 || EmterpreterAsync.state === 3);
    EmterpreterAsync.setState(3);
    if (yieldDuring) {
     resumeCallbacksForYield();
    }
    HEAP32.set(stack, EMTSTACKTOP >> 2);
    assert(stacktop === Module["asm"].stackSave());
    EmterpreterAsync.setState(2);
    if (Browser.mainLoop.func) {
     Browser.mainLoop.resume();
    }
    assert(!EmterpreterAsync.postAsync);
    EmterpreterAsync.postAsync = post || null;
    Module["asm"].emterpret(stack[0]);
    if (!yieldDuring && EmterpreterAsync.state === 0) {
     Browser.resumeAsyncCallbacks();
    }
    if (EmterpreterAsync.state === 0) {
     EmterpreterAsync.asyncFinalizers.forEach((function(func) {
      func();
     }));
     EmterpreterAsync.asyncFinalizers.length = 0;
    }
   });
   callingDoAsyncOp = 0;
   EmterpreterAsync.setState(1);
   EmterpreterAsync.saveStack = (new Error).stack;
   if (Browser.mainLoop.func) {
    Browser.mainLoop.pause();
   }
   if (yieldDuring) {
    setTimeout((function() {
     resumeCallbacksForYield();
    }), 0);
   } else {
    Browser.pauseAsyncCallbacks();
   }
  } else {
   assert(EmterpreterAsync.state === 2);
   EmterpreterAsync.setState(0);
   if (EmterpreterAsync.postAsync) {
    var ret = EmterpreterAsync.postAsync();
    EmterpreterAsync.postAsync = null;
    return ret;
   }
  }
 })
};
function _emscripten_sleep(ms) {
 EmterpreterAsync.handle((function(resume) {
  setTimeout((function() {
   if (ABORT) return;
   resume();
  }), ms);
 }));
}
var SYSCALLS = {
 varargs: 0,
 get: (function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 }),
 getStr: (function() {
  var ret = Pointer_stringify(SYSCALLS.get());
  return ret;
 }),
 get64: (function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0) assert(high === 0); else assert(high === -1);
  return low;
 }),
 getZero: (function() {
  assert(SYSCALLS.get() === 0);
 })
};
function ___syscall140(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
  var offset = offset_low;
  FS.llseek(stream, offset, whence);
  HEAP32[result >> 2] = stream.position;
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall146(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  var ret = 0;
  if (!___syscall146.buffer) {
   ___syscall146.buffers = [ null, [], [] ];
   ___syscall146.printChar = (function(stream, curr) {
    var buffer = ___syscall146.buffers[stream];
    assert(buffer);
    if (curr === 0 || curr === 10) {
     (stream === 1 ? Module["print"] : Module["printErr"])(UTF8ArrayToString(buffer, 0));
     buffer.length = 0;
    } else {
     buffer.push(curr);
    }
   });
  }
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   for (var j = 0; j < len; j++) {
    ___syscall146.printChar(stream, HEAPU8[ptr + j]);
   }
   ret += len;
  }
  return ret;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___unlock() {}
function ___syscall6(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
 Module["requestFullScreen"] = Module["requestFullscreen"];
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
 _emscripten_get_now = (function() {
  return self["performance"]["now"]();
 });
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
 _emscripten_get_now = (function() {
  return performance["now"]();
 });
} else {
 _emscripten_get_now = Date.now;
}
__ATEXIT__.push((function() {
 var fflush = Module["_fflush"];
 if (fflush) fflush(0);
 var printChar = ___syscall146.printChar;
 if (!printChar) return;
 var buffers = ___syscall146.buffers;
 if (buffers[1].length) printChar(1, 10);
 if (buffers[2].length) printChar(2, 10);
}));
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
function nullFunc_ii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function nullFunc_iiii(x) {
 Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
 Module["printErr"]("Build with ASSERTIONS=2 for more info.");
 abort(x);
}
function invoke_ii(index, a1) {
 try {
  return Module["dynCall_ii"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiii(index, a1, a2, a3) {
 try {
  return Module["dynCall_iiii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "enlargeMemory": enlargeMemory,
 "getTotalMemory": getTotalMemory,
 "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
 "abortStackOverflow": abortStackOverflow,
 "nullFunc_ii": nullFunc_ii,
 "nullFunc_iiii": nullFunc_iiii,
 "invoke_ii": invoke_ii,
 "invoke_iiii": invoke_iiii,
 "_emscripten_asm_const_ii": _emscripten_asm_const_ii,
 "_emscripten_sleep": _emscripten_sleep,
 "___lock": ___lock,
 "___syscall6": ___syscall6,
 "___setErrNo": ___setErrNo,
 "_abort": _abort,
 "_emscripten_get_now": _emscripten_get_now,
 "___syscall140": ___syscall140,
 "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "___syscall54": ___syscall54,
 "___unlock": ___unlock,
 "_emscripten_asm_const_v": _emscripten_asm_const_v,
 "_emscripten_set_main_loop": _emscripten_set_main_loop,
 "___syscall146": ___syscall146,
 "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX
};
Module.asmLibraryArg["EMTSTACKTOP"] = EMTSTACKTOP;
Module.asmLibraryArg["EMT_STACK_MAX"] = EMT_STACK_MAX;
Module.asmLibraryArg["eb"] = eb;
// EMSCRIPTEN_START_ASM

var asm = (function(global,env,buffer) {

'almost asm';


  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var enlargeMemory=env.enlargeMemory;
  var getTotalMemory=env.getTotalMemory;
  var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;
  var abortStackOverflow=env.abortStackOverflow;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iiii=env.nullFunc_iiii;
  var invoke_ii=env.invoke_ii;
  var invoke_iiii=env.invoke_iiii;
  var _emscripten_asm_const_ii=env._emscripten_asm_const_ii;
  var _emscripten_sleep=env._emscripten_sleep;
  var ___lock=env.___lock;
  var ___syscall6=env.___syscall6;
  var ___setErrNo=env.___setErrNo;
  var _abort=env._abort;
  var _emscripten_get_now=env._emscripten_get_now;
  var ___syscall140=env.___syscall140;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___syscall54=env.___syscall54;
  var ___unlock=env.___unlock;
  var _emscripten_asm_const_v=env._emscripten_asm_const_v;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var ___syscall146=env.___syscall146;
  var tempFloat = 0.0;
  var asyncState = 0;

var EMTSTACKTOP = env.EMTSTACKTOP|0;
var EMT_STACK_MAX = env.EMT_STACK_MAX|0;
var eb = env.eb|0;
// EMSCRIPTEN_START_FUNCS

function _malloc($0) {
 $0 = $0 | 0;
 var $$$0192$i = 0, $$$0193$i = 0, $$$4236$i = 0, $$$4351$i = 0, $$$i = 0, $$0 = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i18$i = 0, $$01$i$i = 0, $$0189$i = 0, $$0192$lcssa$i = 0, $$01928$i = 0, $$0193$lcssa$i = 0, $$01937$i = 0, $$0197 = 0, $$0199 = 0, $$0206$i$i = 0, $$0207$i$i = 0, $$0211$i$i = 0, $$0212$i$i = 0, $$024371$i = 0, $$0287$i$i = 0, $$0288$i$i = 0, $$0289$i$i = 0, $$0295$i$i = 0, $$0296$i$i = 0, $$0342$i = 0, $$0344$i = 0, $$0345$i = 0, $$0347$i = 0, $$0353$i = 0, $$0358$i = 0, $$0359$$i = 0, $$0359$i = 0, $$0361$i = 0, $$0362$i = 0, $$0368$i = 0, $$1196$i = 0, $$1198$i = 0, $$124470$i = 0, $$1291$i$i = 0, $$1293$i$i = 0, $$1343$i = 0, $$1348$i = 0, $$1363$i = 0, $$1370$i = 0, $$1374$i = 0, $$2234253237$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2355$i = 0, $$3$i = 0, $$3$i$i = 0, $$3$i201 = 0, $$3350$i = 0, $$3372$i = 0, $$4$lcssa$i = 0, $$4$ph$i = 0, $$415$i = 0, $$4236$i = 0, $$4351$lcssa$i = 0, $$435114$i = 0, $$4357$$4$i = 0, $$4357$ph$i = 0, $$435713$i = 0, $$723948$i = 0, $$749$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i19$i = 0, $$pre$i210 = 0, $$pre$i212 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i20$iZ2D = 0, $$pre$phi$i211Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi11$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre10$i$i = 0, $$sink1$i = 0, $$sink1$i$i = 0, $$sink16$i = 0, $$sink2$i = 0, $$sink2$i204 = 0, $$sink3$i = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i208 = 0, $exitcond$i$i = 0, $not$$i = 0, $not$$i$i = 0, $not$$i17$i = 0, $not$$i209 = 0, $not$$i216 = 0, $not$1$i = 0, $not$1$i203 = 0, $not$5$i = 0, $not$7$i$i = 0, $not$8$i = 0, $not$9$i = 0, $or$cond$i = 0, $or$cond$i214 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond11$i = 0, $or$cond11$not$i = 0, $or$cond12$i = 0, $or$cond2$i = 0, $or$cond2$i215 = 0, $or$cond5$i = 0, $or$cond50$i = 0, $or$cond51$i = 0, $or$cond7$i = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 asyncState ? abort(-12) | 0 : 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0), asyncState ? abort(-12) | 0 : 0;
 $1 = sp;
 $2 = $0 >>> 0 < 245;
 do {
  if ($2) {
   $3 = $0 >>> 0 < 11;
   $4 = $0 + 11 | 0;
   $5 = $4 & -8;
   $6 = $3 ? 16 : $5;
   $7 = $6 >>> 3;
   $8 = HEAP32[184] | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 776 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = HEAP32[$17 >> 2] | 0;
    $19 = $18 + 8 | 0;
    $20 = HEAP32[$19 >> 2] | 0;
    $21 = ($16 | 0) == ($20 | 0);
    do {
     if ($21) {
      $22 = 1 << $14;
      $23 = $22 ^ -1;
      $24 = $8 & $23;
      HEAP32[184] = $24;
     } else {
      $25 = HEAP32[752 >> 2] | 0;
      $26 = $20 >>> 0 < $25 >>> 0;
      if ($26) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
      $27 = $20 + 12 | 0;
      $28 = HEAP32[$27 >> 2] | 0;
      $29 = ($28 | 0) == ($18 | 0);
      if ($29) {
       HEAP32[$27 >> 2] = $16;
       HEAP32[$17 >> 2] = $20;
       break;
      } else {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
     }
    } while (0);
    $30 = $14 << 3;
    $31 = $30 | 3;
    $32 = $18 + 4 | 0;
    HEAP32[$32 >> 2] = $31;
    $33 = $18 + $30 | 0;
    $34 = $33 + 4 | 0;
    $35 = HEAP32[$34 >> 2] | 0;
    $36 = $35 | 1;
    HEAP32[$34 >> 2] = $36;
    $$0 = $19;
    STACKTOP = sp;
    return $$0 | 0;
   }
   $37 = HEAP32[744 >> 2] | 0;
   $38 = $6 >>> 0 > $37 >>> 0;
   if ($38) {
    $39 = ($9 | 0) == 0;
    if (!$39) {
     $40 = $9 << $7;
     $41 = 2 << $7;
     $42 = 0 - $41 | 0;
     $43 = $41 | $42;
     $44 = $40 & $43;
     $45 = 0 - $44 | 0;
     $46 = $44 & $45;
     $47 = $46 + -1 | 0;
     $48 = $47 >>> 12;
     $49 = $48 & 16;
     $50 = $47 >>> $49;
     $51 = $50 >>> 5;
     $52 = $51 & 8;
     $53 = $52 | $49;
     $54 = $50 >>> $52;
     $55 = $54 >>> 2;
     $56 = $55 & 4;
     $57 = $53 | $56;
     $58 = $54 >>> $56;
     $59 = $58 >>> 1;
     $60 = $59 & 2;
     $61 = $57 | $60;
     $62 = $58 >>> $60;
     $63 = $62 >>> 1;
     $64 = $63 & 1;
     $65 = $61 | $64;
     $66 = $62 >>> $64;
     $67 = $65 + $66 | 0;
     $68 = $67 << 1;
     $69 = 776 + ($68 << 2) | 0;
     $70 = $69 + 8 | 0;
     $71 = HEAP32[$70 >> 2] | 0;
     $72 = $71 + 8 | 0;
     $73 = HEAP32[$72 >> 2] | 0;
     $74 = ($69 | 0) == ($73 | 0);
     do {
      if ($74) {
       $75 = 1 << $67;
       $76 = $75 ^ -1;
       $77 = $8 & $76;
       HEAP32[184] = $77;
       $98 = $77;
      } else {
       $78 = HEAP32[752 >> 2] | 0;
       $79 = $73 >>> 0 < $78 >>> 0;
       if ($79) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $80 = $73 + 12 | 0;
       $81 = HEAP32[$80 >> 2] | 0;
       $82 = ($81 | 0) == ($71 | 0);
       if ($82) {
        HEAP32[$80 >> 2] = $69;
        HEAP32[$70 >> 2] = $73;
        $98 = $8;
        break;
       } else {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
      }
     } while (0);
     $83 = $67 << 3;
     $84 = $83 - $6 | 0;
     $85 = $6 | 3;
     $86 = $71 + 4 | 0;
     HEAP32[$86 >> 2] = $85;
     $87 = $71 + $6 | 0;
     $88 = $84 | 1;
     $89 = $87 + 4 | 0;
     HEAP32[$89 >> 2] = $88;
     $90 = $87 + $84 | 0;
     HEAP32[$90 >> 2] = $84;
     $91 = ($37 | 0) == 0;
     if (!$91) {
      $92 = HEAP32[756 >> 2] | 0;
      $93 = $37 >>> 3;
      $94 = $93 << 1;
      $95 = 776 + ($94 << 2) | 0;
      $96 = 1 << $93;
      $97 = $98 & $96;
      $99 = ($97 | 0) == 0;
      if ($99) {
       $100 = $98 | $96;
       HEAP32[184] = $100;
       $$pre = $95 + 8 | 0;
       $$0199 = $95;
       $$pre$phiZ2D = $$pre;
      } else {
       $101 = $95 + 8 | 0;
       $102 = HEAP32[$101 >> 2] | 0;
       $103 = HEAP32[752 >> 2] | 0;
       $104 = $102 >>> 0 < $103 >>> 0;
       if ($104) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       } else {
        $$0199 = $102;
        $$pre$phiZ2D = $101;
       }
      }
      HEAP32[$$pre$phiZ2D >> 2] = $92;
      $105 = $$0199 + 12 | 0;
      HEAP32[$105 >> 2] = $92;
      $106 = $92 + 8 | 0;
      HEAP32[$106 >> 2] = $$0199;
      $107 = $92 + 12 | 0;
      HEAP32[$107 >> 2] = $95;
     }
     HEAP32[744 >> 2] = $84;
     HEAP32[756 >> 2] = $87;
     $$0 = $72;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $108 = HEAP32[740 >> 2] | 0;
    $109 = ($108 | 0) == 0;
    if ($109) {
     $$0197 = $6;
    } else {
     $110 = 0 - $108 | 0;
     $111 = $108 & $110;
     $112 = $111 + -1 | 0;
     $113 = $112 >>> 12;
     $114 = $113 & 16;
     $115 = $112 >>> $114;
     $116 = $115 >>> 5;
     $117 = $116 & 8;
     $118 = $117 | $114;
     $119 = $115 >>> $117;
     $120 = $119 >>> 2;
     $121 = $120 & 4;
     $122 = $118 | $121;
     $123 = $119 >>> $121;
     $124 = $123 >>> 1;
     $125 = $124 & 2;
     $126 = $122 | $125;
     $127 = $123 >>> $125;
     $128 = $127 >>> 1;
     $129 = $128 & 1;
     $130 = $126 | $129;
     $131 = $127 >>> $129;
     $132 = $130 + $131 | 0;
     $133 = 1040 + ($132 << 2) | 0;
     $134 = HEAP32[$133 >> 2] | 0;
     $135 = $134 + 4 | 0;
     $136 = HEAP32[$135 >> 2] | 0;
     $137 = $136 & -8;
     $138 = $137 - $6 | 0;
     $139 = $134 + 16 | 0;
     $140 = HEAP32[$139 >> 2] | 0;
     $not$5$i = ($140 | 0) == (0 | 0);
     $$sink16$i = $not$5$i & 1;
     $141 = ($134 + 16 | 0) + ($$sink16$i << 2) | 0;
     $142 = HEAP32[$141 >> 2] | 0;
     $143 = ($142 | 0) == (0 | 0);
     if ($143) {
      $$0192$lcssa$i = $134;
      $$0193$lcssa$i = $138;
     } else {
      $$01928$i = $134;
      $$01937$i = $138;
      $145 = $142;
      while (1) {
       $144 = $145 + 4 | 0;
       $146 = HEAP32[$144 >> 2] | 0;
       $147 = $146 & -8;
       $148 = $147 - $6 | 0;
       $149 = $148 >>> 0 < $$01937$i >>> 0;
       $$$0193$i = $149 ? $148 : $$01937$i;
       $$$0192$i = $149 ? $145 : $$01928$i;
       $150 = $145 + 16 | 0;
       $151 = HEAP32[$150 >> 2] | 0;
       $not$$i = ($151 | 0) == (0 | 0);
       $$sink1$i = $not$$i & 1;
       $152 = ($145 + 16 | 0) + ($$sink1$i << 2) | 0;
       $153 = HEAP32[$152 >> 2] | 0;
       $154 = ($153 | 0) == (0 | 0);
       if ($154) {
        $$0192$lcssa$i = $$$0192$i;
        $$0193$lcssa$i = $$$0193$i;
        break;
       } else {
        $$01928$i = $$$0192$i;
        $$01937$i = $$$0193$i;
        $145 = $153;
       }
      }
     }
     $155 = HEAP32[752 >> 2] | 0;
     $156 = $$0192$lcssa$i >>> 0 < $155 >>> 0;
     if ($156) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $157 = $$0192$lcssa$i + $6 | 0;
     $158 = $$0192$lcssa$i >>> 0 < $157 >>> 0;
     if (!$158) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $159 = $$0192$lcssa$i + 24 | 0;
     $160 = HEAP32[$159 >> 2] | 0;
     $161 = $$0192$lcssa$i + 12 | 0;
     $162 = HEAP32[$161 >> 2] | 0;
     $163 = ($162 | 0) == ($$0192$lcssa$i | 0);
     do {
      if ($163) {
       $173 = $$0192$lcssa$i + 20 | 0;
       $174 = HEAP32[$173 >> 2] | 0;
       $175 = ($174 | 0) == (0 | 0);
       if ($175) {
        $176 = $$0192$lcssa$i + 16 | 0;
        $177 = HEAP32[$176 >> 2] | 0;
        $178 = ($177 | 0) == (0 | 0);
        if ($178) {
         $$3$i = 0;
         break;
        } else {
         $$1196$i = $177;
         $$1198$i = $176;
        }
       } else {
        $$1196$i = $174;
        $$1198$i = $173;
       }
       while (1) {
        $179 = $$1196$i + 20 | 0;
        $180 = HEAP32[$179 >> 2] | 0;
        $181 = ($180 | 0) == (0 | 0);
        if (!$181) {
         $$1196$i = $180;
         $$1198$i = $179;
         continue;
        }
        $182 = $$1196$i + 16 | 0;
        $183 = HEAP32[$182 >> 2] | 0;
        $184 = ($183 | 0) == (0 | 0);
        if ($184) {
         break;
        } else {
         $$1196$i = $183;
         $$1198$i = $182;
        }
       }
       $185 = $$1198$i >>> 0 < $155 >>> 0;
       if ($185) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       } else {
        HEAP32[$$1198$i >> 2] = 0;
        $$3$i = $$1196$i;
        break;
       }
      } else {
       $164 = $$0192$lcssa$i + 8 | 0;
       $165 = HEAP32[$164 >> 2] | 0;
       $166 = $165 >>> 0 < $155 >>> 0;
       if ($166) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $167 = $165 + 12 | 0;
       $168 = HEAP32[$167 >> 2] | 0;
       $169 = ($168 | 0) == ($$0192$lcssa$i | 0);
       if (!$169) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $170 = $162 + 8 | 0;
       $171 = HEAP32[$170 >> 2] | 0;
       $172 = ($171 | 0) == ($$0192$lcssa$i | 0);
       if ($172) {
        HEAP32[$167 >> 2] = $162;
        HEAP32[$170 >> 2] = $165;
        $$3$i = $162;
        break;
       } else {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
      }
     } while (0);
     $186 = ($160 | 0) == (0 | 0);
     L73 : do {
      if (!$186) {
       $187 = $$0192$lcssa$i + 28 | 0;
       $188 = HEAP32[$187 >> 2] | 0;
       $189 = 1040 + ($188 << 2) | 0;
       $190 = HEAP32[$189 >> 2] | 0;
       $191 = ($$0192$lcssa$i | 0) == ($190 | 0);
       do {
        if ($191) {
         HEAP32[$189 >> 2] = $$3$i;
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $192 = 1 << $188;
          $193 = $192 ^ -1;
          $194 = $108 & $193;
          HEAP32[740 >> 2] = $194;
          break L73;
         }
        } else {
         $195 = HEAP32[752 >> 2] | 0;
         $196 = $160 >>> 0 < $195 >>> 0;
         if ($196) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         } else {
          $197 = $160 + 16 | 0;
          $198 = HEAP32[$197 >> 2] | 0;
          $not$1$i = ($198 | 0) != ($$0192$lcssa$i | 0);
          $$sink2$i = $not$1$i & 1;
          $199 = ($160 + 16 | 0) + ($$sink2$i << 2) | 0;
          HEAP32[$199 >> 2] = $$3$i;
          $200 = ($$3$i | 0) == (0 | 0);
          if ($200) {
           break L73;
          } else {
           break;
          }
         }
        }
       } while (0);
       $201 = HEAP32[752 >> 2] | 0;
       $202 = $$3$i >>> 0 < $201 >>> 0;
       if ($202) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $203 = $$3$i + 24 | 0;
       HEAP32[$203 >> 2] = $160;
       $204 = $$0192$lcssa$i + 16 | 0;
       $205 = HEAP32[$204 >> 2] | 0;
       $206 = ($205 | 0) == (0 | 0);
       do {
        if (!$206) {
         $207 = $205 >>> 0 < $201 >>> 0;
         if ($207) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         } else {
          $208 = $$3$i + 16 | 0;
          HEAP32[$208 >> 2] = $205;
          $209 = $205 + 24 | 0;
          HEAP32[$209 >> 2] = $$3$i;
          break;
         }
        }
       } while (0);
       $210 = $$0192$lcssa$i + 20 | 0;
       $211 = HEAP32[$210 >> 2] | 0;
       $212 = ($211 | 0) == (0 | 0);
       if (!$212) {
        $213 = HEAP32[752 >> 2] | 0;
        $214 = $211 >>> 0 < $213 >>> 0;
        if ($214) {
         _abort(), asyncState ? abort(-12) | 0 : 0;
        } else {
         $215 = $$3$i + 20 | 0;
         HEAP32[$215 >> 2] = $211;
         $216 = $211 + 24 | 0;
         HEAP32[$216 >> 2] = $$3$i;
         break;
        }
       }
      }
     } while (0);
     $217 = $$0193$lcssa$i >>> 0 < 16;
     if ($217) {
      $218 = $$0193$lcssa$i + $6 | 0;
      $219 = $218 | 3;
      $220 = $$0192$lcssa$i + 4 | 0;
      HEAP32[$220 >> 2] = $219;
      $221 = $$0192$lcssa$i + $218 | 0;
      $222 = $221 + 4 | 0;
      $223 = HEAP32[$222 >> 2] | 0;
      $224 = $223 | 1;
      HEAP32[$222 >> 2] = $224;
     } else {
      $225 = $6 | 3;
      $226 = $$0192$lcssa$i + 4 | 0;
      HEAP32[$226 >> 2] = $225;
      $227 = $$0193$lcssa$i | 1;
      $228 = $157 + 4 | 0;
      HEAP32[$228 >> 2] = $227;
      $229 = $157 + $$0193$lcssa$i | 0;
      HEAP32[$229 >> 2] = $$0193$lcssa$i;
      $230 = ($37 | 0) == 0;
      if (!$230) {
       $231 = HEAP32[756 >> 2] | 0;
       $232 = $37 >>> 3;
       $233 = $232 << 1;
       $234 = 776 + ($233 << 2) | 0;
       $235 = 1 << $232;
       $236 = $8 & $235;
       $237 = ($236 | 0) == 0;
       if ($237) {
        $238 = $8 | $235;
        HEAP32[184] = $238;
        $$pre$i = $234 + 8 | 0;
        $$0189$i = $234;
        $$pre$phi$iZ2D = $$pre$i;
       } else {
        $239 = $234 + 8 | 0;
        $240 = HEAP32[$239 >> 2] | 0;
        $241 = HEAP32[752 >> 2] | 0;
        $242 = $240 >>> 0 < $241 >>> 0;
        if ($242) {
         _abort(), asyncState ? abort(-12) | 0 : 0;
        } else {
         $$0189$i = $240;
         $$pre$phi$iZ2D = $239;
        }
       }
       HEAP32[$$pre$phi$iZ2D >> 2] = $231;
       $243 = $$0189$i + 12 | 0;
       HEAP32[$243 >> 2] = $231;
       $244 = $231 + 8 | 0;
       HEAP32[$244 >> 2] = $$0189$i;
       $245 = $231 + 12 | 0;
       HEAP32[$245 >> 2] = $234;
      }
      HEAP32[744 >> 2] = $$0193$lcssa$i;
      HEAP32[756 >> 2] = $157;
     }
     $246 = $$0192$lcssa$i + 8 | 0;
     $$0 = $246;
     STACKTOP = sp;
     return $$0 | 0;
    }
   } else {
    $$0197 = $6;
   }
  } else {
   $247 = $0 >>> 0 > 4294967231;
   if ($247) {
    $$0197 = -1;
   } else {
    $248 = $0 + 11 | 0;
    $249 = $248 & -8;
    $250 = HEAP32[740 >> 2] | 0;
    $251 = ($250 | 0) == 0;
    if ($251) {
     $$0197 = $249;
    } else {
     $252 = 0 - $249 | 0;
     $253 = $248 >>> 8;
     $254 = ($253 | 0) == 0;
     if ($254) {
      $$0358$i = 0;
     } else {
      $255 = $249 >>> 0 > 16777215;
      if ($255) {
       $$0358$i = 31;
      } else {
       $256 = $253 + 1048320 | 0;
       $257 = $256 >>> 16;
       $258 = $257 & 8;
       $259 = $253 << $258;
       $260 = $259 + 520192 | 0;
       $261 = $260 >>> 16;
       $262 = $261 & 4;
       $263 = $262 | $258;
       $264 = $259 << $262;
       $265 = $264 + 245760 | 0;
       $266 = $265 >>> 16;
       $267 = $266 & 2;
       $268 = $263 | $267;
       $269 = 14 - $268 | 0;
       $270 = $264 << $267;
       $271 = $270 >>> 15;
       $272 = $269 + $271 | 0;
       $273 = $272 << 1;
       $274 = $272 + 7 | 0;
       $275 = $249 >>> $274;
       $276 = $275 & 1;
       $277 = $276 | $273;
       $$0358$i = $277;
      }
     }
     $278 = 1040 + ($$0358$i << 2) | 0;
     $279 = HEAP32[$278 >> 2] | 0;
     $280 = ($279 | 0) == (0 | 0);
     L117 : do {
      if ($280) {
       $$2355$i = 0;
       $$3$i201 = 0;
       $$3350$i = $252;
       label = 81;
      } else {
       $281 = ($$0358$i | 0) == 31;
       $282 = $$0358$i >>> 1;
       $283 = 25 - $282 | 0;
       $284 = $281 ? 0 : $283;
       $285 = $249 << $284;
       $$0342$i = 0;
       $$0347$i = $252;
       $$0353$i = $279;
       $$0359$i = $285;
       $$0362$i = 0;
       while (1) {
        $286 = $$0353$i + 4 | 0;
        $287 = HEAP32[$286 >> 2] | 0;
        $288 = $287 & -8;
        $289 = $288 - $249 | 0;
        $290 = $289 >>> 0 < $$0347$i >>> 0;
        if ($290) {
         $291 = ($289 | 0) == 0;
         if ($291) {
          $$415$i = $$0353$i;
          $$435114$i = 0;
          $$435713$i = $$0353$i;
          label = 85;
          break L117;
         } else {
          $$1343$i = $$0353$i;
          $$1348$i = $289;
         }
        } else {
         $$1343$i = $$0342$i;
         $$1348$i = $$0347$i;
        }
        $292 = $$0353$i + 20 | 0;
        $293 = HEAP32[$292 >> 2] | 0;
        $294 = $$0359$i >>> 31;
        $295 = ($$0353$i + 16 | 0) + ($294 << 2) | 0;
        $296 = HEAP32[$295 >> 2] | 0;
        $297 = ($293 | 0) == (0 | 0);
        $298 = ($293 | 0) == ($296 | 0);
        $or$cond2$i = $297 | $298;
        $$1363$i = $or$cond2$i ? $$0362$i : $293;
        $299 = ($296 | 0) == (0 | 0);
        $not$8$i = $299 ^ 1;
        $300 = $not$8$i & 1;
        $$0359$$i = $$0359$i << $300;
        if ($299) {
         $$2355$i = $$1363$i;
         $$3$i201 = $$1343$i;
         $$3350$i = $$1348$i;
         label = 81;
         break;
        } else {
         $$0342$i = $$1343$i;
         $$0347$i = $$1348$i;
         $$0353$i = $296;
         $$0359$i = $$0359$$i;
         $$0362$i = $$1363$i;
        }
       }
      }
     } while (0);
     if ((label | 0) == 81) {
      $301 = ($$2355$i | 0) == (0 | 0);
      $302 = ($$3$i201 | 0) == (0 | 0);
      $or$cond$i = $301 & $302;
      if ($or$cond$i) {
       $303 = 2 << $$0358$i;
       $304 = 0 - $303 | 0;
       $305 = $303 | $304;
       $306 = $250 & $305;
       $307 = ($306 | 0) == 0;
       if ($307) {
        $$0197 = $249;
        break;
       }
       $308 = 0 - $306 | 0;
       $309 = $306 & $308;
       $310 = $309 + -1 | 0;
       $311 = $310 >>> 12;
       $312 = $311 & 16;
       $313 = $310 >>> $312;
       $314 = $313 >>> 5;
       $315 = $314 & 8;
       $316 = $315 | $312;
       $317 = $313 >>> $315;
       $318 = $317 >>> 2;
       $319 = $318 & 4;
       $320 = $316 | $319;
       $321 = $317 >>> $319;
       $322 = $321 >>> 1;
       $323 = $322 & 2;
       $324 = $320 | $323;
       $325 = $321 >>> $323;
       $326 = $325 >>> 1;
       $327 = $326 & 1;
       $328 = $324 | $327;
       $329 = $325 >>> $327;
       $330 = $328 + $329 | 0;
       $331 = 1040 + ($330 << 2) | 0;
       $332 = HEAP32[$331 >> 2] | 0;
       $$4$ph$i = 0;
       $$4357$ph$i = $332;
      } else {
       $$4$ph$i = $$3$i201;
       $$4357$ph$i = $$2355$i;
      }
      $333 = ($$4357$ph$i | 0) == (0 | 0);
      if ($333) {
       $$4$lcssa$i = $$4$ph$i;
       $$4351$lcssa$i = $$3350$i;
      } else {
       $$415$i = $$4$ph$i;
       $$435114$i = $$3350$i;
       $$435713$i = $$4357$ph$i;
       label = 85;
      }
     }
     if ((label | 0) == 85) {
      while (1) {
       label = 0;
       $334 = $$435713$i + 4 | 0;
       $335 = HEAP32[$334 >> 2] | 0;
       $336 = $335 & -8;
       $337 = $336 - $249 | 0;
       $338 = $337 >>> 0 < $$435114$i >>> 0;
       $$$4351$i = $338 ? $337 : $$435114$i;
       $$4357$$4$i = $338 ? $$435713$i : $$415$i;
       $339 = $$435713$i + 16 | 0;
       $340 = HEAP32[$339 >> 2] | 0;
       $not$1$i203 = ($340 | 0) == (0 | 0);
       $$sink2$i204 = $not$1$i203 & 1;
       $341 = ($$435713$i + 16 | 0) + ($$sink2$i204 << 2) | 0;
       $342 = HEAP32[$341 >> 2] | 0;
       $343 = ($342 | 0) == (0 | 0);
       if ($343) {
        $$4$lcssa$i = $$4357$$4$i;
        $$4351$lcssa$i = $$$4351$i;
        break;
       } else {
        $$415$i = $$4357$$4$i;
        $$435114$i = $$$4351$i;
        $$435713$i = $342;
        label = 85;
       }
      }
     }
     $344 = ($$4$lcssa$i | 0) == (0 | 0);
     if ($344) {
      $$0197 = $249;
     } else {
      $345 = HEAP32[744 >> 2] | 0;
      $346 = $345 - $249 | 0;
      $347 = $$4351$lcssa$i >>> 0 < $346 >>> 0;
      if ($347) {
       $348 = HEAP32[752 >> 2] | 0;
       $349 = $$4$lcssa$i >>> 0 < $348 >>> 0;
       if ($349) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $350 = $$4$lcssa$i + $249 | 0;
       $351 = $$4$lcssa$i >>> 0 < $350 >>> 0;
       if (!$351) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       }
       $352 = $$4$lcssa$i + 24 | 0;
       $353 = HEAP32[$352 >> 2] | 0;
       $354 = $$4$lcssa$i + 12 | 0;
       $355 = HEAP32[$354 >> 2] | 0;
       $356 = ($355 | 0) == ($$4$lcssa$i | 0);
       do {
        if ($356) {
         $366 = $$4$lcssa$i + 20 | 0;
         $367 = HEAP32[$366 >> 2] | 0;
         $368 = ($367 | 0) == (0 | 0);
         if ($368) {
          $369 = $$4$lcssa$i + 16 | 0;
          $370 = HEAP32[$369 >> 2] | 0;
          $371 = ($370 | 0) == (0 | 0);
          if ($371) {
           $$3372$i = 0;
           break;
          } else {
           $$1370$i = $370;
           $$1374$i = $369;
          }
         } else {
          $$1370$i = $367;
          $$1374$i = $366;
         }
         while (1) {
          $372 = $$1370$i + 20 | 0;
          $373 = HEAP32[$372 >> 2] | 0;
          $374 = ($373 | 0) == (0 | 0);
          if (!$374) {
           $$1370$i = $373;
           $$1374$i = $372;
           continue;
          }
          $375 = $$1370$i + 16 | 0;
          $376 = HEAP32[$375 >> 2] | 0;
          $377 = ($376 | 0) == (0 | 0);
          if ($377) {
           break;
          } else {
           $$1370$i = $376;
           $$1374$i = $375;
          }
         }
         $378 = $$1374$i >>> 0 < $348 >>> 0;
         if ($378) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         } else {
          HEAP32[$$1374$i >> 2] = 0;
          $$3372$i = $$1370$i;
          break;
         }
        } else {
         $357 = $$4$lcssa$i + 8 | 0;
         $358 = HEAP32[$357 >> 2] | 0;
         $359 = $358 >>> 0 < $348 >>> 0;
         if ($359) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         }
         $360 = $358 + 12 | 0;
         $361 = HEAP32[$360 >> 2] | 0;
         $362 = ($361 | 0) == ($$4$lcssa$i | 0);
         if (!$362) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         }
         $363 = $355 + 8 | 0;
         $364 = HEAP32[$363 >> 2] | 0;
         $365 = ($364 | 0) == ($$4$lcssa$i | 0);
         if ($365) {
          HEAP32[$360 >> 2] = $355;
          HEAP32[$363 >> 2] = $358;
          $$3372$i = $355;
          break;
         } else {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         }
        }
       } while (0);
       $379 = ($353 | 0) == (0 | 0);
       L164 : do {
        if ($379) {
         $470 = $250;
        } else {
         $380 = $$4$lcssa$i + 28 | 0;
         $381 = HEAP32[$380 >> 2] | 0;
         $382 = 1040 + ($381 << 2) | 0;
         $383 = HEAP32[$382 >> 2] | 0;
         $384 = ($$4$lcssa$i | 0) == ($383 | 0);
         do {
          if ($384) {
           HEAP32[$382 >> 2] = $$3372$i;
           $cond$i208 = ($$3372$i | 0) == (0 | 0);
           if ($cond$i208) {
            $385 = 1 << $381;
            $386 = $385 ^ -1;
            $387 = $250 & $386;
            HEAP32[740 >> 2] = $387;
            $470 = $387;
            break L164;
           }
          } else {
           $388 = HEAP32[752 >> 2] | 0;
           $389 = $353 >>> 0 < $388 >>> 0;
           if ($389) {
            _abort(), asyncState ? abort(-12) | 0 : 0;
           } else {
            $390 = $353 + 16 | 0;
            $391 = HEAP32[$390 >> 2] | 0;
            $not$$i209 = ($391 | 0) != ($$4$lcssa$i | 0);
            $$sink3$i = $not$$i209 & 1;
            $392 = ($353 + 16 | 0) + ($$sink3$i << 2) | 0;
            HEAP32[$392 >> 2] = $$3372$i;
            $393 = ($$3372$i | 0) == (0 | 0);
            if ($393) {
             $470 = $250;
             break L164;
            } else {
             break;
            }
           }
          }
         } while (0);
         $394 = HEAP32[752 >> 2] | 0;
         $395 = $$3372$i >>> 0 < $394 >>> 0;
         if ($395) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         }
         $396 = $$3372$i + 24 | 0;
         HEAP32[$396 >> 2] = $353;
         $397 = $$4$lcssa$i + 16 | 0;
         $398 = HEAP32[$397 >> 2] | 0;
         $399 = ($398 | 0) == (0 | 0);
         do {
          if (!$399) {
           $400 = $398 >>> 0 < $394 >>> 0;
           if ($400) {
            _abort(), asyncState ? abort(-12) | 0 : 0;
           } else {
            $401 = $$3372$i + 16 | 0;
            HEAP32[$401 >> 2] = $398;
            $402 = $398 + 24 | 0;
            HEAP32[$402 >> 2] = $$3372$i;
            break;
           }
          }
         } while (0);
         $403 = $$4$lcssa$i + 20 | 0;
         $404 = HEAP32[$403 >> 2] | 0;
         $405 = ($404 | 0) == (0 | 0);
         if ($405) {
          $470 = $250;
         } else {
          $406 = HEAP32[752 >> 2] | 0;
          $407 = $404 >>> 0 < $406 >>> 0;
          if ($407) {
           _abort(), asyncState ? abort(-12) | 0 : 0;
          } else {
           $408 = $$3372$i + 20 | 0;
           HEAP32[$408 >> 2] = $404;
           $409 = $404 + 24 | 0;
           HEAP32[$409 >> 2] = $$3372$i;
           $470 = $250;
           break;
          }
         }
        }
       } while (0);
       $410 = $$4351$lcssa$i >>> 0 < 16;
       do {
        if ($410) {
         $411 = $$4351$lcssa$i + $249 | 0;
         $412 = $411 | 3;
         $413 = $$4$lcssa$i + 4 | 0;
         HEAP32[$413 >> 2] = $412;
         $414 = $$4$lcssa$i + $411 | 0;
         $415 = $414 + 4 | 0;
         $416 = HEAP32[$415 >> 2] | 0;
         $417 = $416 | 1;
         HEAP32[$415 >> 2] = $417;
        } else {
         $418 = $249 | 3;
         $419 = $$4$lcssa$i + 4 | 0;
         HEAP32[$419 >> 2] = $418;
         $420 = $$4351$lcssa$i | 1;
         $421 = $350 + 4 | 0;
         HEAP32[$421 >> 2] = $420;
         $422 = $350 + $$4351$lcssa$i | 0;
         HEAP32[$422 >> 2] = $$4351$lcssa$i;
         $423 = $$4351$lcssa$i >>> 3;
         $424 = $$4351$lcssa$i >>> 0 < 256;
         if ($424) {
          $425 = $423 << 1;
          $426 = 776 + ($425 << 2) | 0;
          $427 = HEAP32[184] | 0;
          $428 = 1 << $423;
          $429 = $427 & $428;
          $430 = ($429 | 0) == 0;
          if ($430) {
           $431 = $427 | $428;
           HEAP32[184] = $431;
           $$pre$i210 = $426 + 8 | 0;
           $$0368$i = $426;
           $$pre$phi$i211Z2D = $$pre$i210;
          } else {
           $432 = $426 + 8 | 0;
           $433 = HEAP32[$432 >> 2] | 0;
           $434 = HEAP32[752 >> 2] | 0;
           $435 = $433 >>> 0 < $434 >>> 0;
           if ($435) {
            _abort(), asyncState ? abort(-12) | 0 : 0;
           } else {
            $$0368$i = $433;
            $$pre$phi$i211Z2D = $432;
           }
          }
          HEAP32[$$pre$phi$i211Z2D >> 2] = $350;
          $436 = $$0368$i + 12 | 0;
          HEAP32[$436 >> 2] = $350;
          $437 = $350 + 8 | 0;
          HEAP32[$437 >> 2] = $$0368$i;
          $438 = $350 + 12 | 0;
          HEAP32[$438 >> 2] = $426;
          break;
         }
         $439 = $$4351$lcssa$i >>> 8;
         $440 = ($439 | 0) == 0;
         if ($440) {
          $$0361$i = 0;
         } else {
          $441 = $$4351$lcssa$i >>> 0 > 16777215;
          if ($441) {
           $$0361$i = 31;
          } else {
           $442 = $439 + 1048320 | 0;
           $443 = $442 >>> 16;
           $444 = $443 & 8;
           $445 = $439 << $444;
           $446 = $445 + 520192 | 0;
           $447 = $446 >>> 16;
           $448 = $447 & 4;
           $449 = $448 | $444;
           $450 = $445 << $448;
           $451 = $450 + 245760 | 0;
           $452 = $451 >>> 16;
           $453 = $452 & 2;
           $454 = $449 | $453;
           $455 = 14 - $454 | 0;
           $456 = $450 << $453;
           $457 = $456 >>> 15;
           $458 = $455 + $457 | 0;
           $459 = $458 << 1;
           $460 = $458 + 7 | 0;
           $461 = $$4351$lcssa$i >>> $460;
           $462 = $461 & 1;
           $463 = $462 | $459;
           $$0361$i = $463;
          }
         }
         $464 = 1040 + ($$0361$i << 2) | 0;
         $465 = $350 + 28 | 0;
         HEAP32[$465 >> 2] = $$0361$i;
         $466 = $350 + 16 | 0;
         $467 = $466 + 4 | 0;
         HEAP32[$467 >> 2] = 0;
         HEAP32[$466 >> 2] = 0;
         $468 = 1 << $$0361$i;
         $469 = $470 & $468;
         $471 = ($469 | 0) == 0;
         if ($471) {
          $472 = $470 | $468;
          HEAP32[740 >> 2] = $472;
          HEAP32[$464 >> 2] = $350;
          $473 = $350 + 24 | 0;
          HEAP32[$473 >> 2] = $464;
          $474 = $350 + 12 | 0;
          HEAP32[$474 >> 2] = $350;
          $475 = $350 + 8 | 0;
          HEAP32[$475 >> 2] = $350;
          break;
         }
         $476 = HEAP32[$464 >> 2] | 0;
         $477 = ($$0361$i | 0) == 31;
         $478 = $$0361$i >>> 1;
         $479 = 25 - $478 | 0;
         $480 = $477 ? 0 : $479;
         $481 = $$4351$lcssa$i << $480;
         $$0344$i = $481;
         $$0345$i = $476;
         while (1) {
          $482 = $$0345$i + 4 | 0;
          $483 = HEAP32[$482 >> 2] | 0;
          $484 = $483 & -8;
          $485 = ($484 | 0) == ($$4351$lcssa$i | 0);
          if ($485) {
           label = 139;
           break;
          }
          $486 = $$0344$i >>> 31;
          $487 = ($$0345$i + 16 | 0) + ($486 << 2) | 0;
          $488 = $$0344$i << 1;
          $489 = HEAP32[$487 >> 2] | 0;
          $490 = ($489 | 0) == (0 | 0);
          if ($490) {
           label = 136;
           break;
          } else {
           $$0344$i = $488;
           $$0345$i = $489;
          }
         }
         if ((label | 0) == 136) {
          $491 = HEAP32[752 >> 2] | 0;
          $492 = $487 >>> 0 < $491 >>> 0;
          if ($492) {
           _abort(), asyncState ? abort(-12) | 0 : 0;
          } else {
           HEAP32[$487 >> 2] = $350;
           $493 = $350 + 24 | 0;
           HEAP32[$493 >> 2] = $$0345$i;
           $494 = $350 + 12 | 0;
           HEAP32[$494 >> 2] = $350;
           $495 = $350 + 8 | 0;
           HEAP32[$495 >> 2] = $350;
           break;
          }
         } else if ((label | 0) == 139) {
          $496 = $$0345$i + 8 | 0;
          $497 = HEAP32[$496 >> 2] | 0;
          $498 = HEAP32[752 >> 2] | 0;
          $499 = $497 >>> 0 >= $498 >>> 0;
          $not$9$i = $$0345$i >>> 0 >= $498 >>> 0;
          $500 = $499 & $not$9$i;
          if ($500) {
           $501 = $497 + 12 | 0;
           HEAP32[$501 >> 2] = $350;
           HEAP32[$496 >> 2] = $350;
           $502 = $350 + 8 | 0;
           HEAP32[$502 >> 2] = $497;
           $503 = $350 + 12 | 0;
           HEAP32[$503 >> 2] = $$0345$i;
           $504 = $350 + 24 | 0;
           HEAP32[$504 >> 2] = 0;
           break;
          } else {
           _abort(), asyncState ? abort(-12) | 0 : 0;
          }
         }
        }
       } while (0);
       $505 = $$4$lcssa$i + 8 | 0;
       $$0 = $505;
       STACKTOP = sp;
       return $$0 | 0;
      } else {
       $$0197 = $249;
      }
     }
    }
   }
  }
 } while (0);
 $506 = HEAP32[744 >> 2] | 0;
 $507 = $506 >>> 0 < $$0197 >>> 0;
 if (!$507) {
  $508 = $506 - $$0197 | 0;
  $509 = HEAP32[756 >> 2] | 0;
  $510 = $508 >>> 0 > 15;
  if ($510) {
   $511 = $509 + $$0197 | 0;
   HEAP32[756 >> 2] = $511;
   HEAP32[744 >> 2] = $508;
   $512 = $508 | 1;
   $513 = $511 + 4 | 0;
   HEAP32[$513 >> 2] = $512;
   $514 = $511 + $508 | 0;
   HEAP32[$514 >> 2] = $508;
   $515 = $$0197 | 3;
   $516 = $509 + 4 | 0;
   HEAP32[$516 >> 2] = $515;
  } else {
   HEAP32[744 >> 2] = 0;
   HEAP32[756 >> 2] = 0;
   $517 = $506 | 3;
   $518 = $509 + 4 | 0;
   HEAP32[$518 >> 2] = $517;
   $519 = $509 + $506 | 0;
   $520 = $519 + 4 | 0;
   $521 = HEAP32[$520 >> 2] | 0;
   $522 = $521 | 1;
   HEAP32[$520 >> 2] = $522;
  }
  $523 = $509 + 8 | 0;
  $$0 = $523;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $524 = HEAP32[748 >> 2] | 0;
 $525 = $524 >>> 0 > $$0197 >>> 0;
 if ($525) {
  $526 = $524 - $$0197 | 0;
  HEAP32[748 >> 2] = $526;
  $527 = HEAP32[760 >> 2] | 0;
  $528 = $527 + $$0197 | 0;
  HEAP32[760 >> 2] = $528;
  $529 = $526 | 1;
  $530 = $528 + 4 | 0;
  HEAP32[$530 >> 2] = $529;
  $531 = $$0197 | 3;
  $532 = $527 + 4 | 0;
  HEAP32[$532 >> 2] = $531;
  $533 = $527 + 8 | 0;
  $$0 = $533;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $534 = HEAP32[302] | 0;
 $535 = ($534 | 0) == 0;
 if ($535) {
  HEAP32[1216 >> 2] = 4096;
  HEAP32[1212 >> 2] = 4096;
  HEAP32[1220 >> 2] = -1;
  HEAP32[1224 >> 2] = -1;
  HEAP32[1228 >> 2] = 0;
  HEAP32[1180 >> 2] = 0;
  $536 = $1;
  $537 = $536 & -16;
  $538 = $537 ^ 1431655768;
  HEAP32[$1 >> 2] = $538;
  HEAP32[302] = $538;
  $542 = 4096;
 } else {
  $$pre$i212 = HEAP32[1216 >> 2] | 0;
  $542 = $$pre$i212;
 }
 $539 = $$0197 + 48 | 0;
 $540 = $$0197 + 47 | 0;
 $541 = $542 + $540 | 0;
 $543 = 0 - $542 | 0;
 $544 = $541 & $543;
 $545 = $544 >>> 0 > $$0197 >>> 0;
 if (!$545) {
  $$0 = 0;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $546 = HEAP32[1176 >> 2] | 0;
 $547 = ($546 | 0) == 0;
 if (!$547) {
  $548 = HEAP32[1168 >> 2] | 0;
  $549 = $548 + $544 | 0;
  $550 = $549 >>> 0 <= $548 >>> 0;
  $551 = $549 >>> 0 > $546 >>> 0;
  $or$cond1$i = $550 | $551;
  if ($or$cond1$i) {
   $$0 = 0;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $552 = HEAP32[1180 >> 2] | 0;
 $553 = $552 & 4;
 $554 = ($553 | 0) == 0;
 L244 : do {
  if ($554) {
   $555 = HEAP32[760 >> 2] | 0;
   $556 = ($555 | 0) == (0 | 0);
   L246 : do {
    if ($556) {
     label = 163;
    } else {
     $$0$i$i = 1184;
     while (1) {
      $557 = HEAP32[$$0$i$i >> 2] | 0;
      $558 = $557 >>> 0 > $555 >>> 0;
      if (!$558) {
       $559 = $$0$i$i + 4 | 0;
       $560 = HEAP32[$559 >> 2] | 0;
       $561 = $557 + $560 | 0;
       $562 = $561 >>> 0 > $555 >>> 0;
       if ($562) {
        break;
       }
      }
      $563 = $$0$i$i + 8 | 0;
      $564 = HEAP32[$563 >> 2] | 0;
      $565 = ($564 | 0) == (0 | 0);
      if ($565) {
       label = 163;
       break L246;
      } else {
       $$0$i$i = $564;
      }
     }
     $588 = $541 - $524 | 0;
     $589 = $588 & $543;
     $590 = $589 >>> 0 < 2147483647;
     if ($590) {
      $591 = (tempInt = _sbrk($589 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $592 = HEAP32[$$0$i$i >> 2] | 0;
      $593 = HEAP32[$559 >> 2] | 0;
      $594 = $592 + $593 | 0;
      $595 = ($591 | 0) == ($594 | 0);
      if ($595) {
       $596 = ($591 | 0) == (-1 | 0);
       if ($596) {
        $$2234253237$i = $589;
       } else {
        $$723948$i = $589;
        $$749$i = $591;
        label = 180;
        break L244;
       }
      } else {
       $$2247$ph$i = $591;
       $$2253$ph$i = $589;
       label = 171;
      }
     } else {
      $$2234253237$i = 0;
     }
    }
   } while (0);
   do {
    if ((label | 0) == 163) {
     $566 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $567 = ($566 | 0) == (-1 | 0);
     if ($567) {
      $$2234253237$i = 0;
     } else {
      $568 = $566;
      $569 = HEAP32[1212 >> 2] | 0;
      $570 = $569 + -1 | 0;
      $571 = $570 & $568;
      $572 = ($571 | 0) == 0;
      $573 = $570 + $568 | 0;
      $574 = 0 - $569 | 0;
      $575 = $573 & $574;
      $576 = $575 - $568 | 0;
      $577 = $572 ? 0 : $576;
      $$$i = $577 + $544 | 0;
      $578 = HEAP32[1168 >> 2] | 0;
      $579 = $$$i + $578 | 0;
      $580 = $$$i >>> 0 > $$0197 >>> 0;
      $581 = $$$i >>> 0 < 2147483647;
      $or$cond$i214 = $580 & $581;
      if ($or$cond$i214) {
       $582 = HEAP32[1176 >> 2] | 0;
       $583 = ($582 | 0) == 0;
       if (!$583) {
        $584 = $579 >>> 0 <= $578 >>> 0;
        $585 = $579 >>> 0 > $582 >>> 0;
        $or$cond2$i215 = $584 | $585;
        if ($or$cond2$i215) {
         $$2234253237$i = 0;
         break;
        }
       }
       $586 = (tempInt = _sbrk($$$i | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
       $587 = ($586 | 0) == ($566 | 0);
       if ($587) {
        $$723948$i = $$$i;
        $$749$i = $566;
        label = 180;
        break L244;
       } else {
        $$2247$ph$i = $586;
        $$2253$ph$i = $$$i;
        label = 171;
       }
      } else {
       $$2234253237$i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 171) {
     $597 = 0 - $$2253$ph$i | 0;
     $598 = ($$2247$ph$i | 0) != (-1 | 0);
     $599 = $$2253$ph$i >>> 0 < 2147483647;
     $or$cond7$i = $599 & $598;
     $600 = $539 >>> 0 > $$2253$ph$i >>> 0;
     $or$cond10$i = $600 & $or$cond7$i;
     if (!$or$cond10$i) {
      $610 = ($$2247$ph$i | 0) == (-1 | 0);
      if ($610) {
       $$2234253237$i = 0;
       break;
      } else {
       $$723948$i = $$2253$ph$i;
       $$749$i = $$2247$ph$i;
       label = 180;
       break L244;
      }
     }
     $601 = HEAP32[1216 >> 2] | 0;
     $602 = $540 - $$2253$ph$i | 0;
     $603 = $602 + $601 | 0;
     $604 = 0 - $601 | 0;
     $605 = $603 & $604;
     $606 = $605 >>> 0 < 2147483647;
     if (!$606) {
      $$723948$i = $$2253$ph$i;
      $$749$i = $$2247$ph$i;
      label = 180;
      break L244;
     }
     $607 = (tempInt = _sbrk($605 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
     $608 = ($607 | 0) == (-1 | 0);
     if ($608) {
      (tempInt = _sbrk($597 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
      $$2234253237$i = 0;
      break;
     } else {
      $609 = $605 + $$2253$ph$i | 0;
      $$723948$i = $609;
      $$749$i = $$2247$ph$i;
      label = 180;
      break L244;
     }
    }
   } while (0);
   $611 = HEAP32[1180 >> 2] | 0;
   $612 = $611 | 4;
   HEAP32[1180 >> 2] = $612;
   $$4236$i = $$2234253237$i;
   label = 178;
  } else {
   $$4236$i = 0;
   label = 178;
  }
 } while (0);
 if ((label | 0) == 178) {
  $613 = $544 >>> 0 < 2147483647;
  if ($613) {
   $614 = (tempInt = _sbrk($544 | 0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $615 = (tempInt = _sbrk(0) | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
   $616 = ($614 | 0) != (-1 | 0);
   $617 = ($615 | 0) != (-1 | 0);
   $or$cond5$i = $616 & $617;
   $618 = $614 >>> 0 < $615 >>> 0;
   $or$cond11$i = $618 & $or$cond5$i;
   $619 = $615;
   $620 = $614;
   $621 = $619 - $620 | 0;
   $622 = $$0197 + 40 | 0;
   $623 = $621 >>> 0 > $622 >>> 0;
   $$$4236$i = $623 ? $621 : $$4236$i;
   $or$cond11$not$i = $or$cond11$i ^ 1;
   $624 = ($614 | 0) == (-1 | 0);
   $not$$i216 = $623 ^ 1;
   $625 = $624 | $not$$i216;
   $or$cond50$i = $625 | $or$cond11$not$i;
   if (!$or$cond50$i) {
    $$723948$i = $$$4236$i;
    $$749$i = $614;
    label = 180;
   }
  }
 }
 if ((label | 0) == 180) {
  $626 = HEAP32[1168 >> 2] | 0;
  $627 = $626 + $$723948$i | 0;
  HEAP32[1168 >> 2] = $627;
  $628 = HEAP32[1172 >> 2] | 0;
  $629 = $627 >>> 0 > $628 >>> 0;
  if ($629) {
   HEAP32[1172 >> 2] = $627;
  }
  $630 = HEAP32[760 >> 2] | 0;
  $631 = ($630 | 0) == (0 | 0);
  do {
   if ($631) {
    $632 = HEAP32[752 >> 2] | 0;
    $633 = ($632 | 0) == (0 | 0);
    $634 = $$749$i >>> 0 < $632 >>> 0;
    $or$cond12$i = $633 | $634;
    if ($or$cond12$i) {
     HEAP32[752 >> 2] = $$749$i;
    }
    HEAP32[1184 >> 2] = $$749$i;
    HEAP32[1188 >> 2] = $$723948$i;
    HEAP32[1196 >> 2] = 0;
    $635 = HEAP32[302] | 0;
    HEAP32[772 >> 2] = $635;
    HEAP32[768 >> 2] = -1;
    $$01$i$i = 0;
    while (1) {
     $636 = $$01$i$i << 1;
     $637 = 776 + ($636 << 2) | 0;
     $638 = $637 + 12 | 0;
     HEAP32[$638 >> 2] = $637;
     $639 = $637 + 8 | 0;
     HEAP32[$639 >> 2] = $637;
     $640 = $$01$i$i + 1 | 0;
     $exitcond$i$i = ($640 | 0) == 32;
     if ($exitcond$i$i) {
      break;
     } else {
      $$01$i$i = $640;
     }
    }
    $641 = $$723948$i + -40 | 0;
    $642 = $$749$i + 8 | 0;
    $643 = $642;
    $644 = $643 & 7;
    $645 = ($644 | 0) == 0;
    $646 = 0 - $643 | 0;
    $647 = $646 & 7;
    $648 = $645 ? 0 : $647;
    $649 = $$749$i + $648 | 0;
    $650 = $641 - $648 | 0;
    HEAP32[760 >> 2] = $649;
    HEAP32[748 >> 2] = $650;
    $651 = $650 | 1;
    $652 = $649 + 4 | 0;
    HEAP32[$652 >> 2] = $651;
    $653 = $649 + $650 | 0;
    $654 = $653 + 4 | 0;
    HEAP32[$654 >> 2] = 40;
    $655 = HEAP32[1224 >> 2] | 0;
    HEAP32[764 >> 2] = $655;
   } else {
    $$024371$i = 1184;
    while (1) {
     $656 = HEAP32[$$024371$i >> 2] | 0;
     $657 = $$024371$i + 4 | 0;
     $658 = HEAP32[$657 >> 2] | 0;
     $659 = $656 + $658 | 0;
     $660 = ($$749$i | 0) == ($659 | 0);
     if ($660) {
      label = 190;
      break;
     }
     $661 = $$024371$i + 8 | 0;
     $662 = HEAP32[$661 >> 2] | 0;
     $663 = ($662 | 0) == (0 | 0);
     if ($663) {
      break;
     } else {
      $$024371$i = $662;
     }
    }
    if ((label | 0) == 190) {
     $664 = $$024371$i + 12 | 0;
     $665 = HEAP32[$664 >> 2] | 0;
     $666 = $665 & 8;
     $667 = ($666 | 0) == 0;
     if ($667) {
      $668 = $630 >>> 0 >= $656 >>> 0;
      $669 = $630 >>> 0 < $$749$i >>> 0;
      $or$cond51$i = $669 & $668;
      if ($or$cond51$i) {
       $670 = $658 + $$723948$i | 0;
       HEAP32[$657 >> 2] = $670;
       $671 = HEAP32[748 >> 2] | 0;
       $672 = $630 + 8 | 0;
       $673 = $672;
       $674 = $673 & 7;
       $675 = ($674 | 0) == 0;
       $676 = 0 - $673 | 0;
       $677 = $676 & 7;
       $678 = $675 ? 0 : $677;
       $679 = $630 + $678 | 0;
       $680 = $$723948$i - $678 | 0;
       $681 = $671 + $680 | 0;
       HEAP32[760 >> 2] = $679;
       HEAP32[748 >> 2] = $681;
       $682 = $681 | 1;
       $683 = $679 + 4 | 0;
       HEAP32[$683 >> 2] = $682;
       $684 = $679 + $681 | 0;
       $685 = $684 + 4 | 0;
       HEAP32[$685 >> 2] = 40;
       $686 = HEAP32[1224 >> 2] | 0;
       HEAP32[764 >> 2] = $686;
       break;
      }
     }
    }
    $687 = HEAP32[752 >> 2] | 0;
    $688 = $$749$i >>> 0 < $687 >>> 0;
    if ($688) {
     HEAP32[752 >> 2] = $$749$i;
     $752 = $$749$i;
    } else {
     $752 = $687;
    }
    $689 = $$749$i + $$723948$i | 0;
    $$124470$i = 1184;
    while (1) {
     $690 = HEAP32[$$124470$i >> 2] | 0;
     $691 = ($690 | 0) == ($689 | 0);
     if ($691) {
      label = 198;
      break;
     }
     $692 = $$124470$i + 8 | 0;
     $693 = HEAP32[$692 >> 2] | 0;
     $694 = ($693 | 0) == (0 | 0);
     if ($694) {
      break;
     } else {
      $$124470$i = $693;
     }
    }
    if ((label | 0) == 198) {
     $695 = $$124470$i + 12 | 0;
     $696 = HEAP32[$695 >> 2] | 0;
     $697 = $696 & 8;
     $698 = ($697 | 0) == 0;
     if ($698) {
      HEAP32[$$124470$i >> 2] = $$749$i;
      $699 = $$124470$i + 4 | 0;
      $700 = HEAP32[$699 >> 2] | 0;
      $701 = $700 + $$723948$i | 0;
      HEAP32[$699 >> 2] = $701;
      $702 = $$749$i + 8 | 0;
      $703 = $702;
      $704 = $703 & 7;
      $705 = ($704 | 0) == 0;
      $706 = 0 - $703 | 0;
      $707 = $706 & 7;
      $708 = $705 ? 0 : $707;
      $709 = $$749$i + $708 | 0;
      $710 = $689 + 8 | 0;
      $711 = $710;
      $712 = $711 & 7;
      $713 = ($712 | 0) == 0;
      $714 = 0 - $711 | 0;
      $715 = $714 & 7;
      $716 = $713 ? 0 : $715;
      $717 = $689 + $716 | 0;
      $718 = $717;
      $719 = $709;
      $720 = $718 - $719 | 0;
      $721 = $709 + $$0197 | 0;
      $722 = $720 - $$0197 | 0;
      $723 = $$0197 | 3;
      $724 = $709 + 4 | 0;
      HEAP32[$724 >> 2] = $723;
      $725 = ($717 | 0) == ($630 | 0);
      do {
       if ($725) {
        $726 = HEAP32[748 >> 2] | 0;
        $727 = $726 + $722 | 0;
        HEAP32[748 >> 2] = $727;
        HEAP32[760 >> 2] = $721;
        $728 = $727 | 1;
        $729 = $721 + 4 | 0;
        HEAP32[$729 >> 2] = $728;
       } else {
        $730 = HEAP32[756 >> 2] | 0;
        $731 = ($717 | 0) == ($730 | 0);
        if ($731) {
         $732 = HEAP32[744 >> 2] | 0;
         $733 = $732 + $722 | 0;
         HEAP32[744 >> 2] = $733;
         HEAP32[756 >> 2] = $721;
         $734 = $733 | 1;
         $735 = $721 + 4 | 0;
         HEAP32[$735 >> 2] = $734;
         $736 = $721 + $733 | 0;
         HEAP32[$736 >> 2] = $733;
         break;
        }
        $737 = $717 + 4 | 0;
        $738 = HEAP32[$737 >> 2] | 0;
        $739 = $738 & 3;
        $740 = ($739 | 0) == 1;
        if ($740) {
         $741 = $738 & -8;
         $742 = $738 >>> 3;
         $743 = $738 >>> 0 < 256;
         L314 : do {
          if ($743) {
           $744 = $717 + 8 | 0;
           $745 = HEAP32[$744 >> 2] | 0;
           $746 = $717 + 12 | 0;
           $747 = HEAP32[$746 >> 2] | 0;
           $748 = $742 << 1;
           $749 = 776 + ($748 << 2) | 0;
           $750 = ($745 | 0) == ($749 | 0);
           do {
            if (!$750) {
             $751 = $745 >>> 0 < $752 >>> 0;
             if ($751) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             }
             $753 = $745 + 12 | 0;
             $754 = HEAP32[$753 >> 2] | 0;
             $755 = ($754 | 0) == ($717 | 0);
             if ($755) {
              break;
             }
             _abort(), asyncState ? abort(-12) | 0 : 0;
            }
           } while (0);
           $756 = ($747 | 0) == ($745 | 0);
           if ($756) {
            $757 = 1 << $742;
            $758 = $757 ^ -1;
            $759 = HEAP32[184] | 0;
            $760 = $759 & $758;
            HEAP32[184] = $760;
            break;
           }
           $761 = ($747 | 0) == ($749 | 0);
           do {
            if ($761) {
             $$pre10$i$i = $747 + 8 | 0;
             $$pre$phi11$i$iZ2D = $$pre10$i$i;
            } else {
             $762 = $747 >>> 0 < $752 >>> 0;
             if ($762) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             }
             $763 = $747 + 8 | 0;
             $764 = HEAP32[$763 >> 2] | 0;
             $765 = ($764 | 0) == ($717 | 0);
             if ($765) {
              $$pre$phi11$i$iZ2D = $763;
              break;
             }
             _abort(), asyncState ? abort(-12) | 0 : 0;
            }
           } while (0);
           $766 = $745 + 12 | 0;
           HEAP32[$766 >> 2] = $747;
           HEAP32[$$pre$phi11$i$iZ2D >> 2] = $745;
          } else {
           $767 = $717 + 24 | 0;
           $768 = HEAP32[$767 >> 2] | 0;
           $769 = $717 + 12 | 0;
           $770 = HEAP32[$769 >> 2] | 0;
           $771 = ($770 | 0) == ($717 | 0);
           do {
            if ($771) {
             $781 = $717 + 16 | 0;
             $782 = $781 + 4 | 0;
             $783 = HEAP32[$782 >> 2] | 0;
             $784 = ($783 | 0) == (0 | 0);
             if ($784) {
              $785 = HEAP32[$781 >> 2] | 0;
              $786 = ($785 | 0) == (0 | 0);
              if ($786) {
               $$3$i$i = 0;
               break;
              } else {
               $$1291$i$i = $785;
               $$1293$i$i = $781;
              }
             } else {
              $$1291$i$i = $783;
              $$1293$i$i = $782;
             }
             while (1) {
              $787 = $$1291$i$i + 20 | 0;
              $788 = HEAP32[$787 >> 2] | 0;
              $789 = ($788 | 0) == (0 | 0);
              if (!$789) {
               $$1291$i$i = $788;
               $$1293$i$i = $787;
               continue;
              }
              $790 = $$1291$i$i + 16 | 0;
              $791 = HEAP32[$790 >> 2] | 0;
              $792 = ($791 | 0) == (0 | 0);
              if ($792) {
               break;
              } else {
               $$1291$i$i = $791;
               $$1293$i$i = $790;
              }
             }
             $793 = $$1293$i$i >>> 0 < $752 >>> 0;
             if ($793) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             } else {
              HEAP32[$$1293$i$i >> 2] = 0;
              $$3$i$i = $$1291$i$i;
              break;
             }
            } else {
             $772 = $717 + 8 | 0;
             $773 = HEAP32[$772 >> 2] | 0;
             $774 = $773 >>> 0 < $752 >>> 0;
             if ($774) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             }
             $775 = $773 + 12 | 0;
             $776 = HEAP32[$775 >> 2] | 0;
             $777 = ($776 | 0) == ($717 | 0);
             if (!$777) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             }
             $778 = $770 + 8 | 0;
             $779 = HEAP32[$778 >> 2] | 0;
             $780 = ($779 | 0) == ($717 | 0);
             if ($780) {
              HEAP32[$775 >> 2] = $770;
              HEAP32[$778 >> 2] = $773;
              $$3$i$i = $770;
              break;
             } else {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             }
            }
           } while (0);
           $794 = ($768 | 0) == (0 | 0);
           if ($794) {
            break;
           }
           $795 = $717 + 28 | 0;
           $796 = HEAP32[$795 >> 2] | 0;
           $797 = 1040 + ($796 << 2) | 0;
           $798 = HEAP32[$797 >> 2] | 0;
           $799 = ($717 | 0) == ($798 | 0);
           do {
            if ($799) {
             HEAP32[$797 >> 2] = $$3$i$i;
             $cond$i$i = ($$3$i$i | 0) == (0 | 0);
             if (!$cond$i$i) {
              break;
             }
             $800 = 1 << $796;
             $801 = $800 ^ -1;
             $802 = HEAP32[740 >> 2] | 0;
             $803 = $802 & $801;
             HEAP32[740 >> 2] = $803;
             break L314;
            } else {
             $804 = HEAP32[752 >> 2] | 0;
             $805 = $768 >>> 0 < $804 >>> 0;
             if ($805) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             } else {
              $806 = $768 + 16 | 0;
              $807 = HEAP32[$806 >> 2] | 0;
              $not$$i17$i = ($807 | 0) != ($717 | 0);
              $$sink1$i$i = $not$$i17$i & 1;
              $808 = ($768 + 16 | 0) + ($$sink1$i$i << 2) | 0;
              HEAP32[$808 >> 2] = $$3$i$i;
              $809 = ($$3$i$i | 0) == (0 | 0);
              if ($809) {
               break L314;
              } else {
               break;
              }
             }
            }
           } while (0);
           $810 = HEAP32[752 >> 2] | 0;
           $811 = $$3$i$i >>> 0 < $810 >>> 0;
           if ($811) {
            _abort(), asyncState ? abort(-12) | 0 : 0;
           }
           $812 = $$3$i$i + 24 | 0;
           HEAP32[$812 >> 2] = $768;
           $813 = $717 + 16 | 0;
           $814 = HEAP32[$813 >> 2] | 0;
           $815 = ($814 | 0) == (0 | 0);
           do {
            if (!$815) {
             $816 = $814 >>> 0 < $810 >>> 0;
             if ($816) {
              _abort(), asyncState ? abort(-12) | 0 : 0;
             } else {
              $817 = $$3$i$i + 16 | 0;
              HEAP32[$817 >> 2] = $814;
              $818 = $814 + 24 | 0;
              HEAP32[$818 >> 2] = $$3$i$i;
              break;
             }
            }
           } while (0);
           $819 = $813 + 4 | 0;
           $820 = HEAP32[$819 >> 2] | 0;
           $821 = ($820 | 0) == (0 | 0);
           if ($821) {
            break;
           }
           $822 = HEAP32[752 >> 2] | 0;
           $823 = $820 >>> 0 < $822 >>> 0;
           if ($823) {
            _abort(), asyncState ? abort(-12) | 0 : 0;
           } else {
            $824 = $$3$i$i + 20 | 0;
            HEAP32[$824 >> 2] = $820;
            $825 = $820 + 24 | 0;
            HEAP32[$825 >> 2] = $$3$i$i;
            break;
           }
          }
         } while (0);
         $826 = $717 + $741 | 0;
         $827 = $741 + $722 | 0;
         $$0$i18$i = $826;
         $$0287$i$i = $827;
        } else {
         $$0$i18$i = $717;
         $$0287$i$i = $722;
        }
        $828 = $$0$i18$i + 4 | 0;
        $829 = HEAP32[$828 >> 2] | 0;
        $830 = $829 & -2;
        HEAP32[$828 >> 2] = $830;
        $831 = $$0287$i$i | 1;
        $832 = $721 + 4 | 0;
        HEAP32[$832 >> 2] = $831;
        $833 = $721 + $$0287$i$i | 0;
        HEAP32[$833 >> 2] = $$0287$i$i;
        $834 = $$0287$i$i >>> 3;
        $835 = $$0287$i$i >>> 0 < 256;
        if ($835) {
         $836 = $834 << 1;
         $837 = 776 + ($836 << 2) | 0;
         $838 = HEAP32[184] | 0;
         $839 = 1 << $834;
         $840 = $838 & $839;
         $841 = ($840 | 0) == 0;
         do {
          if ($841) {
           $842 = $838 | $839;
           HEAP32[184] = $842;
           $$pre$i19$i = $837 + 8 | 0;
           $$0295$i$i = $837;
           $$pre$phi$i20$iZ2D = $$pre$i19$i;
          } else {
           $843 = $837 + 8 | 0;
           $844 = HEAP32[$843 >> 2] | 0;
           $845 = HEAP32[752 >> 2] | 0;
           $846 = $844 >>> 0 < $845 >>> 0;
           if (!$846) {
            $$0295$i$i = $844;
            $$pre$phi$i20$iZ2D = $843;
            break;
           }
           _abort(), asyncState ? abort(-12) | 0 : 0;
          }
         } while (0);
         HEAP32[$$pre$phi$i20$iZ2D >> 2] = $721;
         $847 = $$0295$i$i + 12 | 0;
         HEAP32[$847 >> 2] = $721;
         $848 = $721 + 8 | 0;
         HEAP32[$848 >> 2] = $$0295$i$i;
         $849 = $721 + 12 | 0;
         HEAP32[$849 >> 2] = $837;
         break;
        }
        $850 = $$0287$i$i >>> 8;
        $851 = ($850 | 0) == 0;
        do {
         if ($851) {
          $$0296$i$i = 0;
         } else {
          $852 = $$0287$i$i >>> 0 > 16777215;
          if ($852) {
           $$0296$i$i = 31;
           break;
          }
          $853 = $850 + 1048320 | 0;
          $854 = $853 >>> 16;
          $855 = $854 & 8;
          $856 = $850 << $855;
          $857 = $856 + 520192 | 0;
          $858 = $857 >>> 16;
          $859 = $858 & 4;
          $860 = $859 | $855;
          $861 = $856 << $859;
          $862 = $861 + 245760 | 0;
          $863 = $862 >>> 16;
          $864 = $863 & 2;
          $865 = $860 | $864;
          $866 = 14 - $865 | 0;
          $867 = $861 << $864;
          $868 = $867 >>> 15;
          $869 = $866 + $868 | 0;
          $870 = $869 << 1;
          $871 = $869 + 7 | 0;
          $872 = $$0287$i$i >>> $871;
          $873 = $872 & 1;
          $874 = $873 | $870;
          $$0296$i$i = $874;
         }
        } while (0);
        $875 = 1040 + ($$0296$i$i << 2) | 0;
        $876 = $721 + 28 | 0;
        HEAP32[$876 >> 2] = $$0296$i$i;
        $877 = $721 + 16 | 0;
        $878 = $877 + 4 | 0;
        HEAP32[$878 >> 2] = 0;
        HEAP32[$877 >> 2] = 0;
        $879 = HEAP32[740 >> 2] | 0;
        $880 = 1 << $$0296$i$i;
        $881 = $879 & $880;
        $882 = ($881 | 0) == 0;
        if ($882) {
         $883 = $879 | $880;
         HEAP32[740 >> 2] = $883;
         HEAP32[$875 >> 2] = $721;
         $884 = $721 + 24 | 0;
         HEAP32[$884 >> 2] = $875;
         $885 = $721 + 12 | 0;
         HEAP32[$885 >> 2] = $721;
         $886 = $721 + 8 | 0;
         HEAP32[$886 >> 2] = $721;
         break;
        }
        $887 = HEAP32[$875 >> 2] | 0;
        $888 = ($$0296$i$i | 0) == 31;
        $889 = $$0296$i$i >>> 1;
        $890 = 25 - $889 | 0;
        $891 = $888 ? 0 : $890;
        $892 = $$0287$i$i << $891;
        $$0288$i$i = $892;
        $$0289$i$i = $887;
        while (1) {
         $893 = $$0289$i$i + 4 | 0;
         $894 = HEAP32[$893 >> 2] | 0;
         $895 = $894 & -8;
         $896 = ($895 | 0) == ($$0287$i$i | 0);
         if ($896) {
          label = 265;
          break;
         }
         $897 = $$0288$i$i >>> 31;
         $898 = ($$0289$i$i + 16 | 0) + ($897 << 2) | 0;
         $899 = $$0288$i$i << 1;
         $900 = HEAP32[$898 >> 2] | 0;
         $901 = ($900 | 0) == (0 | 0);
         if ($901) {
          label = 262;
          break;
         } else {
          $$0288$i$i = $899;
          $$0289$i$i = $900;
         }
        }
        if ((label | 0) == 262) {
         $902 = HEAP32[752 >> 2] | 0;
         $903 = $898 >>> 0 < $902 >>> 0;
         if ($903) {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         } else {
          HEAP32[$898 >> 2] = $721;
          $904 = $721 + 24 | 0;
          HEAP32[$904 >> 2] = $$0289$i$i;
          $905 = $721 + 12 | 0;
          HEAP32[$905 >> 2] = $721;
          $906 = $721 + 8 | 0;
          HEAP32[$906 >> 2] = $721;
          break;
         }
        } else if ((label | 0) == 265) {
         $907 = $$0289$i$i + 8 | 0;
         $908 = HEAP32[$907 >> 2] | 0;
         $909 = HEAP32[752 >> 2] | 0;
         $910 = $908 >>> 0 >= $909 >>> 0;
         $not$7$i$i = $$0289$i$i >>> 0 >= $909 >>> 0;
         $911 = $910 & $not$7$i$i;
         if ($911) {
          $912 = $908 + 12 | 0;
          HEAP32[$912 >> 2] = $721;
          HEAP32[$907 >> 2] = $721;
          $913 = $721 + 8 | 0;
          HEAP32[$913 >> 2] = $908;
          $914 = $721 + 12 | 0;
          HEAP32[$914 >> 2] = $$0289$i$i;
          $915 = $721 + 24 | 0;
          HEAP32[$915 >> 2] = 0;
          break;
         } else {
          _abort(), asyncState ? abort(-12) | 0 : 0;
         }
        }
       }
      } while (0);
      $1047 = $709 + 8 | 0;
      $$0 = $1047;
      STACKTOP = sp;
      return $$0 | 0;
     }
    }
    $$0$i$i$i = 1184;
    while (1) {
     $916 = HEAP32[$$0$i$i$i >> 2] | 0;
     $917 = $916 >>> 0 > $630 >>> 0;
     if (!$917) {
      $918 = $$0$i$i$i + 4 | 0;
      $919 = HEAP32[$918 >> 2] | 0;
      $920 = $916 + $919 | 0;
      $921 = $920 >>> 0 > $630 >>> 0;
      if ($921) {
       break;
      }
     }
     $922 = $$0$i$i$i + 8 | 0;
     $923 = HEAP32[$922 >> 2] | 0;
     $$0$i$i$i = $923;
    }
    $924 = $920 + -47 | 0;
    $925 = $924 + 8 | 0;
    $926 = $925;
    $927 = $926 & 7;
    $928 = ($927 | 0) == 0;
    $929 = 0 - $926 | 0;
    $930 = $929 & 7;
    $931 = $928 ? 0 : $930;
    $932 = $924 + $931 | 0;
    $933 = $630 + 16 | 0;
    $934 = $932 >>> 0 < $933 >>> 0;
    $935 = $934 ? $630 : $932;
    $936 = $935 + 8 | 0;
    $937 = $935 + 24 | 0;
    $938 = $$723948$i + -40 | 0;
    $939 = $$749$i + 8 | 0;
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941 | 0) == 0;
    $943 = 0 - $940 | 0;
    $944 = $943 & 7;
    $945 = $942 ? 0 : $944;
    $946 = $$749$i + $945 | 0;
    $947 = $938 - $945 | 0;
    HEAP32[760 >> 2] = $946;
    HEAP32[748 >> 2] = $947;
    $948 = $947 | 1;
    $949 = $946 + 4 | 0;
    HEAP32[$949 >> 2] = $948;
    $950 = $946 + $947 | 0;
    $951 = $950 + 4 | 0;
    HEAP32[$951 >> 2] = 40;
    $952 = HEAP32[1224 >> 2] | 0;
    HEAP32[764 >> 2] = $952;
    $953 = $935 + 4 | 0;
    HEAP32[$953 >> 2] = 27;
    HEAP32[$936 >> 2] = HEAP32[1184 >> 2] | 0;
    HEAP32[$936 + 4 >> 2] = HEAP32[1184 + 4 >> 2] | 0;
    HEAP32[$936 + 8 >> 2] = HEAP32[1184 + 8 >> 2] | 0;
    HEAP32[$936 + 12 >> 2] = HEAP32[1184 + 12 >> 2] | 0;
    HEAP32[1184 >> 2] = $$749$i;
    HEAP32[1188 >> 2] = $$723948$i;
    HEAP32[1196 >> 2] = 0;
    HEAP32[1192 >> 2] = $936;
    $955 = $937;
    while (1) {
     $954 = $955 + 4 | 0;
     HEAP32[$954 >> 2] = 7;
     $956 = $955 + 8 | 0;
     $957 = $956 >>> 0 < $920 >>> 0;
     if ($957) {
      $955 = $954;
     } else {
      break;
     }
    }
    $958 = ($935 | 0) == ($630 | 0);
    if (!$958) {
     $959 = $935;
     $960 = $630;
     $961 = $959 - $960 | 0;
     $962 = HEAP32[$953 >> 2] | 0;
     $963 = $962 & -2;
     HEAP32[$953 >> 2] = $963;
     $964 = $961 | 1;
     $965 = $630 + 4 | 0;
     HEAP32[$965 >> 2] = $964;
     HEAP32[$935 >> 2] = $961;
     $966 = $961 >>> 3;
     $967 = $961 >>> 0 < 256;
     if ($967) {
      $968 = $966 << 1;
      $969 = 776 + ($968 << 2) | 0;
      $970 = HEAP32[184] | 0;
      $971 = 1 << $966;
      $972 = $970 & $971;
      $973 = ($972 | 0) == 0;
      if ($973) {
       $974 = $970 | $971;
       HEAP32[184] = $974;
       $$pre$i$i = $969 + 8 | 0;
       $$0211$i$i = $969;
       $$pre$phi$i$iZ2D = $$pre$i$i;
      } else {
       $975 = $969 + 8 | 0;
       $976 = HEAP32[$975 >> 2] | 0;
       $977 = HEAP32[752 >> 2] | 0;
       $978 = $976 >>> 0 < $977 >>> 0;
       if ($978) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       } else {
        $$0211$i$i = $976;
        $$pre$phi$i$iZ2D = $975;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D >> 2] = $630;
      $979 = $$0211$i$i + 12 | 0;
      HEAP32[$979 >> 2] = $630;
      $980 = $630 + 8 | 0;
      HEAP32[$980 >> 2] = $$0211$i$i;
      $981 = $630 + 12 | 0;
      HEAP32[$981 >> 2] = $969;
      break;
     }
     $982 = $961 >>> 8;
     $983 = ($982 | 0) == 0;
     if ($983) {
      $$0212$i$i = 0;
     } else {
      $984 = $961 >>> 0 > 16777215;
      if ($984) {
       $$0212$i$i = 31;
      } else {
       $985 = $982 + 1048320 | 0;
       $986 = $985 >>> 16;
       $987 = $986 & 8;
       $988 = $982 << $987;
       $989 = $988 + 520192 | 0;
       $990 = $989 >>> 16;
       $991 = $990 & 4;
       $992 = $991 | $987;
       $993 = $988 << $991;
       $994 = $993 + 245760 | 0;
       $995 = $994 >>> 16;
       $996 = $995 & 2;
       $997 = $992 | $996;
       $998 = 14 - $997 | 0;
       $999 = $993 << $996;
       $1000 = $999 >>> 15;
       $1001 = $998 + $1000 | 0;
       $1002 = $1001 << 1;
       $1003 = $1001 + 7 | 0;
       $1004 = $961 >>> $1003;
       $1005 = $1004 & 1;
       $1006 = $1005 | $1002;
       $$0212$i$i = $1006;
      }
     }
     $1007 = 1040 + ($$0212$i$i << 2) | 0;
     $1008 = $630 + 28 | 0;
     HEAP32[$1008 >> 2] = $$0212$i$i;
     $1009 = $630 + 20 | 0;
     HEAP32[$1009 >> 2] = 0;
     HEAP32[$933 >> 2] = 0;
     $1010 = HEAP32[740 >> 2] | 0;
     $1011 = 1 << $$0212$i$i;
     $1012 = $1010 & $1011;
     $1013 = ($1012 | 0) == 0;
     if ($1013) {
      $1014 = $1010 | $1011;
      HEAP32[740 >> 2] = $1014;
      HEAP32[$1007 >> 2] = $630;
      $1015 = $630 + 24 | 0;
      HEAP32[$1015 >> 2] = $1007;
      $1016 = $630 + 12 | 0;
      HEAP32[$1016 >> 2] = $630;
      $1017 = $630 + 8 | 0;
      HEAP32[$1017 >> 2] = $630;
      break;
     }
     $1018 = HEAP32[$1007 >> 2] | 0;
     $1019 = ($$0212$i$i | 0) == 31;
     $1020 = $$0212$i$i >>> 1;
     $1021 = 25 - $1020 | 0;
     $1022 = $1019 ? 0 : $1021;
     $1023 = $961 << $1022;
     $$0206$i$i = $1023;
     $$0207$i$i = $1018;
     while (1) {
      $1024 = $$0207$i$i + 4 | 0;
      $1025 = HEAP32[$1024 >> 2] | 0;
      $1026 = $1025 & -8;
      $1027 = ($1026 | 0) == ($961 | 0);
      if ($1027) {
       label = 292;
       break;
      }
      $1028 = $$0206$i$i >>> 31;
      $1029 = ($$0207$i$i + 16 | 0) + ($1028 << 2) | 0;
      $1030 = $$0206$i$i << 1;
      $1031 = HEAP32[$1029 >> 2] | 0;
      $1032 = ($1031 | 0) == (0 | 0);
      if ($1032) {
       label = 289;
       break;
      } else {
       $$0206$i$i = $1030;
       $$0207$i$i = $1031;
      }
     }
     if ((label | 0) == 289) {
      $1033 = HEAP32[752 >> 2] | 0;
      $1034 = $1029 >>> 0 < $1033 >>> 0;
      if ($1034) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      } else {
       HEAP32[$1029 >> 2] = $630;
       $1035 = $630 + 24 | 0;
       HEAP32[$1035 >> 2] = $$0207$i$i;
       $1036 = $630 + 12 | 0;
       HEAP32[$1036 >> 2] = $630;
       $1037 = $630 + 8 | 0;
       HEAP32[$1037 >> 2] = $630;
       break;
      }
     } else if ((label | 0) == 292) {
      $1038 = $$0207$i$i + 8 | 0;
      $1039 = HEAP32[$1038 >> 2] | 0;
      $1040 = HEAP32[752 >> 2] | 0;
      $1041 = $1039 >>> 0 >= $1040 >>> 0;
      $not$$i$i = $$0207$i$i >>> 0 >= $1040 >>> 0;
      $1042 = $1041 & $not$$i$i;
      if ($1042) {
       $1043 = $1039 + 12 | 0;
       HEAP32[$1043 >> 2] = $630;
       HEAP32[$1038 >> 2] = $630;
       $1044 = $630 + 8 | 0;
       HEAP32[$1044 >> 2] = $1039;
       $1045 = $630 + 12 | 0;
       HEAP32[$1045 >> 2] = $$0207$i$i;
       $1046 = $630 + 24 | 0;
       HEAP32[$1046 >> 2] = 0;
       break;
      } else {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
     }
    }
   }
  } while (0);
  $1048 = HEAP32[748 >> 2] | 0;
  $1049 = $1048 >>> 0 > $$0197 >>> 0;
  if ($1049) {
   $1050 = $1048 - $$0197 | 0;
   HEAP32[748 >> 2] = $1050;
   $1051 = HEAP32[760 >> 2] | 0;
   $1052 = $1051 + $$0197 | 0;
   HEAP32[760 >> 2] = $1052;
   $1053 = $1050 | 1;
   $1054 = $1052 + 4 | 0;
   HEAP32[$1054 >> 2] = $1053;
   $1055 = $$0197 | 3;
   $1056 = $1051 + 4 | 0;
   HEAP32[$1056 >> 2] = $1055;
   $1057 = $1051 + 8 | 0;
   $$0 = $1057;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $1058 = (tempInt = ___errno_location() | 0, asyncState ? abort(-12) | 0 : tempInt) | 0;
 HEAP32[$1058 >> 2] = 12;
 $$0 = 0;
 STACKTOP = sp;
 return $$0 | 0;
}

function _free($0) {
 $0 = $0 | 0;
 var $$0212$i = 0, $$0212$in$i = 0, $$0383 = 0, $$0384 = 0, $$0396 = 0, $$0403 = 0, $$1 = 0, $$1382 = 0, $$1387 = 0, $$1390 = 0, $$1398 = 0, $$1402 = 0, $$2 = 0, $$3 = 0, $$3400 = 0, $$pre = 0, $$pre$phi443Z2D = 0, $$pre$phi445Z2D = 0, $$pre$phiZ2D = 0, $$pre442 = 0, $$pre444 = 0, $$sink3 = 0, $$sink5 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond421 = 0, $cond422 = 0, $not$ = 0, $not$405 = 0, $not$437 = 0, label = 0, sp = 0;
 label = 0;
 sp = STACKTOP;
 $1 = ($0 | 0) == (0 | 0);
 asyncState ? abort(-12) | 0 : 0;
 if ($1) {
  return;
 }
 $2 = $0 + -8 | 0;
 $3 = HEAP32[752 >> 2] | 0;
 $4 = $2 >>> 0 < $3 >>> 0;
 if ($4) {
  _abort(), asyncState ? abort(-12) | 0 : 0;
 }
 $5 = $0 + -4 | 0;
 $6 = HEAP32[$5 >> 2] | 0;
 $7 = $6 & 3;
 $8 = ($7 | 0) == 1;
 if ($8) {
  _abort(), asyncState ? abort(-12) | 0 : 0;
 }
 $9 = $6 & -8;
 $10 = $2 + $9 | 0;
 $11 = $6 & 1;
 $12 = ($11 | 0) == 0;
 L10 : do {
  if ($12) {
   $13 = HEAP32[$2 >> 2] | 0;
   $14 = ($7 | 0) == 0;
   if ($14) {
    return;
   }
   $15 = 0 - $13 | 0;
   $16 = $2 + $15 | 0;
   $17 = $13 + $9 | 0;
   $18 = $16 >>> 0 < $3 >>> 0;
   if ($18) {
    _abort(), asyncState ? abort(-12) | 0 : 0;
   }
   $19 = HEAP32[756 >> 2] | 0;
   $20 = ($16 | 0) == ($19 | 0);
   if ($20) {
    $104 = $10 + 4 | 0;
    $105 = HEAP32[$104 >> 2] | 0;
    $106 = $105 & 3;
    $107 = ($106 | 0) == 3;
    if (!$107) {
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
     break;
    }
    $108 = $16 + $17 | 0;
    $109 = $16 + 4 | 0;
    $110 = $17 | 1;
    $111 = $105 & -2;
    HEAP32[744 >> 2] = $17;
    HEAP32[$104 >> 2] = $111;
    HEAP32[$109 >> 2] = $110;
    HEAP32[$108 >> 2] = $17;
    return;
   }
   $21 = $13 >>> 3;
   $22 = $13 >>> 0 < 256;
   if ($22) {
    $23 = $16 + 8 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    $25 = $16 + 12 | 0;
    $26 = HEAP32[$25 >> 2] | 0;
    $27 = $21 << 1;
    $28 = 776 + ($27 << 2) | 0;
    $29 = ($24 | 0) == ($28 | 0);
    if (!$29) {
     $30 = $24 >>> 0 < $3 >>> 0;
     if ($30) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $31 = $24 + 12 | 0;
     $32 = HEAP32[$31 >> 2] | 0;
     $33 = ($32 | 0) == ($16 | 0);
     if (!$33) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
    }
    $34 = ($26 | 0) == ($24 | 0);
    if ($34) {
     $35 = 1 << $21;
     $36 = $35 ^ -1;
     $37 = HEAP32[184] | 0;
     $38 = $37 & $36;
     HEAP32[184] = $38;
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
     break;
    }
    $39 = ($26 | 0) == ($28 | 0);
    if ($39) {
     $$pre444 = $26 + 8 | 0;
     $$pre$phi445Z2D = $$pre444;
    } else {
     $40 = $26 >>> 0 < $3 >>> 0;
     if ($40) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $41 = $26 + 8 | 0;
     $42 = HEAP32[$41 >> 2] | 0;
     $43 = ($42 | 0) == ($16 | 0);
     if ($43) {
      $$pre$phi445Z2D = $41;
     } else {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
    }
    $44 = $24 + 12 | 0;
    HEAP32[$44 >> 2] = $26;
    HEAP32[$$pre$phi445Z2D >> 2] = $24;
    $$1 = $16;
    $$1382 = $17;
    $113 = $16;
    break;
   }
   $45 = $16 + 24 | 0;
   $46 = HEAP32[$45 >> 2] | 0;
   $47 = $16 + 12 | 0;
   $48 = HEAP32[$47 >> 2] | 0;
   $49 = ($48 | 0) == ($16 | 0);
   do {
    if ($49) {
     $59 = $16 + 16 | 0;
     $60 = $59 + 4 | 0;
     $61 = HEAP32[$60 >> 2] | 0;
     $62 = ($61 | 0) == (0 | 0);
     if ($62) {
      $63 = HEAP32[$59 >> 2] | 0;
      $64 = ($63 | 0) == (0 | 0);
      if ($64) {
       $$3 = 0;
       break;
      } else {
       $$1387 = $63;
       $$1390 = $59;
      }
     } else {
      $$1387 = $61;
      $$1390 = $60;
     }
     while (1) {
      $65 = $$1387 + 20 | 0;
      $66 = HEAP32[$65 >> 2] | 0;
      $67 = ($66 | 0) == (0 | 0);
      if (!$67) {
       $$1387 = $66;
       $$1390 = $65;
       continue;
      }
      $68 = $$1387 + 16 | 0;
      $69 = HEAP32[$68 >> 2] | 0;
      $70 = ($69 | 0) == (0 | 0);
      if ($70) {
       break;
      } else {
       $$1387 = $69;
       $$1390 = $68;
      }
     }
     $71 = $$1390 >>> 0 < $3 >>> 0;
     if ($71) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     } else {
      HEAP32[$$1390 >> 2] = 0;
      $$3 = $$1387;
      break;
     }
    } else {
     $50 = $16 + 8 | 0;
     $51 = HEAP32[$50 >> 2] | 0;
     $52 = $51 >>> 0 < $3 >>> 0;
     if ($52) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $53 = $51 + 12 | 0;
     $54 = HEAP32[$53 >> 2] | 0;
     $55 = ($54 | 0) == ($16 | 0);
     if (!$55) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $56 = $48 + 8 | 0;
     $57 = HEAP32[$56 >> 2] | 0;
     $58 = ($57 | 0) == ($16 | 0);
     if ($58) {
      HEAP32[$53 >> 2] = $48;
      HEAP32[$56 >> 2] = $51;
      $$3 = $48;
      break;
     } else {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
    }
   } while (0);
   $72 = ($46 | 0) == (0 | 0);
   if ($72) {
    $$1 = $16;
    $$1382 = $17;
    $113 = $16;
   } else {
    $73 = $16 + 28 | 0;
    $74 = HEAP32[$73 >> 2] | 0;
    $75 = 1040 + ($74 << 2) | 0;
    $76 = HEAP32[$75 >> 2] | 0;
    $77 = ($16 | 0) == ($76 | 0);
    do {
     if ($77) {
      HEAP32[$75 >> 2] = $$3;
      $cond421 = ($$3 | 0) == (0 | 0);
      if ($cond421) {
       $78 = 1 << $74;
       $79 = $78 ^ -1;
       $80 = HEAP32[740 >> 2] | 0;
       $81 = $80 & $79;
       HEAP32[740 >> 2] = $81;
       $$1 = $16;
       $$1382 = $17;
       $113 = $16;
       break L10;
      }
     } else {
      $82 = HEAP32[752 >> 2] | 0;
      $83 = $46 >>> 0 < $82 >>> 0;
      if ($83) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      } else {
       $84 = $46 + 16 | 0;
       $85 = HEAP32[$84 >> 2] | 0;
       $not$405 = ($85 | 0) != ($16 | 0);
       $$sink3 = $not$405 & 1;
       $86 = ($46 + 16 | 0) + ($$sink3 << 2) | 0;
       HEAP32[$86 >> 2] = $$3;
       $87 = ($$3 | 0) == (0 | 0);
       if ($87) {
        $$1 = $16;
        $$1382 = $17;
        $113 = $16;
        break L10;
       } else {
        break;
       }
      }
     }
    } while (0);
    $88 = HEAP32[752 >> 2] | 0;
    $89 = $$3 >>> 0 < $88 >>> 0;
    if ($89) {
     _abort(), asyncState ? abort(-12) | 0 : 0;
    }
    $90 = $$3 + 24 | 0;
    HEAP32[$90 >> 2] = $46;
    $91 = $16 + 16 | 0;
    $92 = HEAP32[$91 >> 2] | 0;
    $93 = ($92 | 0) == (0 | 0);
    do {
     if (!$93) {
      $94 = $92 >>> 0 < $88 >>> 0;
      if ($94) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      } else {
       $95 = $$3 + 16 | 0;
       HEAP32[$95 >> 2] = $92;
       $96 = $92 + 24 | 0;
       HEAP32[$96 >> 2] = $$3;
       break;
      }
     }
    } while (0);
    $97 = $91 + 4 | 0;
    $98 = HEAP32[$97 >> 2] | 0;
    $99 = ($98 | 0) == (0 | 0);
    if ($99) {
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
    } else {
     $100 = HEAP32[752 >> 2] | 0;
     $101 = $98 >>> 0 < $100 >>> 0;
     if ($101) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     } else {
      $102 = $$3 + 20 | 0;
      HEAP32[$102 >> 2] = $98;
      $103 = $98 + 24 | 0;
      HEAP32[$103 >> 2] = $$3;
      $$1 = $16;
      $$1382 = $17;
      $113 = $16;
      break;
     }
    }
   }
  } else {
   $$1 = $2;
   $$1382 = $9;
   $113 = $2;
  }
 } while (0);
 $112 = $113 >>> 0 < $10 >>> 0;
 if (!$112) {
  _abort(), asyncState ? abort(-12) | 0 : 0;
 }
 $114 = $10 + 4 | 0;
 $115 = HEAP32[$114 >> 2] | 0;
 $116 = $115 & 1;
 $117 = ($116 | 0) == 0;
 if ($117) {
  _abort(), asyncState ? abort(-12) | 0 : 0;
 }
 $118 = $115 & 2;
 $119 = ($118 | 0) == 0;
 if ($119) {
  $120 = HEAP32[760 >> 2] | 0;
  $121 = ($10 | 0) == ($120 | 0);
  $122 = HEAP32[756 >> 2] | 0;
  if ($121) {
   $123 = HEAP32[748 >> 2] | 0;
   $124 = $123 + $$1382 | 0;
   HEAP32[748 >> 2] = $124;
   HEAP32[760 >> 2] = $$1;
   $125 = $124 | 1;
   $126 = $$1 + 4 | 0;
   HEAP32[$126 >> 2] = $125;
   $127 = ($$1 | 0) == ($122 | 0);
   if (!$127) {
    return;
   }
   HEAP32[756 >> 2] = 0;
   HEAP32[744 >> 2] = 0;
   return;
  }
  $128 = ($10 | 0) == ($122 | 0);
  if ($128) {
   $129 = HEAP32[744 >> 2] | 0;
   $130 = $129 + $$1382 | 0;
   HEAP32[744 >> 2] = $130;
   HEAP32[756 >> 2] = $113;
   $131 = $130 | 1;
   $132 = $$1 + 4 | 0;
   HEAP32[$132 >> 2] = $131;
   $133 = $113 + $130 | 0;
   HEAP32[$133 >> 2] = $130;
   return;
  }
  $134 = $115 & -8;
  $135 = $134 + $$1382 | 0;
  $136 = $115 >>> 3;
  $137 = $115 >>> 0 < 256;
  L108 : do {
   if ($137) {
    $138 = $10 + 8 | 0;
    $139 = HEAP32[$138 >> 2] | 0;
    $140 = $10 + 12 | 0;
    $141 = HEAP32[$140 >> 2] | 0;
    $142 = $136 << 1;
    $143 = 776 + ($142 << 2) | 0;
    $144 = ($139 | 0) == ($143 | 0);
    if (!$144) {
     $145 = HEAP32[752 >> 2] | 0;
     $146 = $139 >>> 0 < $145 >>> 0;
     if ($146) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $147 = $139 + 12 | 0;
     $148 = HEAP32[$147 >> 2] | 0;
     $149 = ($148 | 0) == ($10 | 0);
     if (!$149) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
    }
    $150 = ($141 | 0) == ($139 | 0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[184] | 0;
     $154 = $153 & $152;
     HEAP32[184] = $154;
     break;
    }
    $155 = ($141 | 0) == ($143 | 0);
    if ($155) {
     $$pre442 = $141 + 8 | 0;
     $$pre$phi443Z2D = $$pre442;
    } else {
     $156 = HEAP32[752 >> 2] | 0;
     $157 = $141 >>> 0 < $156 >>> 0;
     if ($157) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $158 = $141 + 8 | 0;
     $159 = HEAP32[$158 >> 2] | 0;
     $160 = ($159 | 0) == ($10 | 0);
     if ($160) {
      $$pre$phi443Z2D = $158;
     } else {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
    }
    $161 = $139 + 12 | 0;
    HEAP32[$161 >> 2] = $141;
    HEAP32[$$pre$phi443Z2D >> 2] = $139;
   } else {
    $162 = $10 + 24 | 0;
    $163 = HEAP32[$162 >> 2] | 0;
    $164 = $10 + 12 | 0;
    $165 = HEAP32[$164 >> 2] | 0;
    $166 = ($165 | 0) == ($10 | 0);
    do {
     if ($166) {
      $177 = $10 + 16 | 0;
      $178 = $177 + 4 | 0;
      $179 = HEAP32[$178 >> 2] | 0;
      $180 = ($179 | 0) == (0 | 0);
      if ($180) {
       $181 = HEAP32[$177 >> 2] | 0;
       $182 = ($181 | 0) == (0 | 0);
       if ($182) {
        $$3400 = 0;
        break;
       } else {
        $$1398 = $181;
        $$1402 = $177;
       }
      } else {
       $$1398 = $179;
       $$1402 = $178;
      }
      while (1) {
       $183 = $$1398 + 20 | 0;
       $184 = HEAP32[$183 >> 2] | 0;
       $185 = ($184 | 0) == (0 | 0);
       if (!$185) {
        $$1398 = $184;
        $$1402 = $183;
        continue;
       }
       $186 = $$1398 + 16 | 0;
       $187 = HEAP32[$186 >> 2] | 0;
       $188 = ($187 | 0) == (0 | 0);
       if ($188) {
        break;
       } else {
        $$1398 = $187;
        $$1402 = $186;
       }
      }
      $189 = HEAP32[752 >> 2] | 0;
      $190 = $$1402 >>> 0 < $189 >>> 0;
      if ($190) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      } else {
       HEAP32[$$1402 >> 2] = 0;
       $$3400 = $$1398;
       break;
      }
     } else {
      $167 = $10 + 8 | 0;
      $168 = HEAP32[$167 >> 2] | 0;
      $169 = HEAP32[752 >> 2] | 0;
      $170 = $168 >>> 0 < $169 >>> 0;
      if ($170) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
      $171 = $168 + 12 | 0;
      $172 = HEAP32[$171 >> 2] | 0;
      $173 = ($172 | 0) == ($10 | 0);
      if (!$173) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
      $174 = $165 + 8 | 0;
      $175 = HEAP32[$174 >> 2] | 0;
      $176 = ($175 | 0) == ($10 | 0);
      if ($176) {
       HEAP32[$171 >> 2] = $165;
       HEAP32[$174 >> 2] = $168;
       $$3400 = $165;
       break;
      } else {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      }
     }
    } while (0);
    $191 = ($163 | 0) == (0 | 0);
    if (!$191) {
     $192 = $10 + 28 | 0;
     $193 = HEAP32[$192 >> 2] | 0;
     $194 = 1040 + ($193 << 2) | 0;
     $195 = HEAP32[$194 >> 2] | 0;
     $196 = ($10 | 0) == ($195 | 0);
     do {
      if ($196) {
       HEAP32[$194 >> 2] = $$3400;
       $cond422 = ($$3400 | 0) == (0 | 0);
       if ($cond422) {
        $197 = 1 << $193;
        $198 = $197 ^ -1;
        $199 = HEAP32[740 >> 2] | 0;
        $200 = $199 & $198;
        HEAP32[740 >> 2] = $200;
        break L108;
       }
      } else {
       $201 = HEAP32[752 >> 2] | 0;
       $202 = $163 >>> 0 < $201 >>> 0;
       if ($202) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       } else {
        $203 = $163 + 16 | 0;
        $204 = HEAP32[$203 >> 2] | 0;
        $not$ = ($204 | 0) != ($10 | 0);
        $$sink5 = $not$ & 1;
        $205 = ($163 + 16 | 0) + ($$sink5 << 2) | 0;
        HEAP32[$205 >> 2] = $$3400;
        $206 = ($$3400 | 0) == (0 | 0);
        if ($206) {
         break L108;
        } else {
         break;
        }
       }
      }
     } while (0);
     $207 = HEAP32[752 >> 2] | 0;
     $208 = $$3400 >>> 0 < $207 >>> 0;
     if ($208) {
      _abort(), asyncState ? abort(-12) | 0 : 0;
     }
     $209 = $$3400 + 24 | 0;
     HEAP32[$209 >> 2] = $163;
     $210 = $10 + 16 | 0;
     $211 = HEAP32[$210 >> 2] | 0;
     $212 = ($211 | 0) == (0 | 0);
     do {
      if (!$212) {
       $213 = $211 >>> 0 < $207 >>> 0;
       if ($213) {
        _abort(), asyncState ? abort(-12) | 0 : 0;
       } else {
        $214 = $$3400 + 16 | 0;
        HEAP32[$214 >> 2] = $211;
        $215 = $211 + 24 | 0;
        HEAP32[$215 >> 2] = $$3400;
        break;
       }
      }
     } while (0);
     $216 = $210 + 4 | 0;
     $217 = HEAP32[$216 >> 2] | 0;
     $218 = ($217 | 0) == (0 | 0);
     if (!$218) {
      $219 = HEAP32[752 >> 2] | 0;
      $220 = $217 >>> 0 < $219 >>> 0;
      if ($220) {
       _abort(), asyncState ? abort(-12) | 0 : 0;
      } else {
       $221 = $$3400 + 20 | 0;
       HEAP32[$221 >> 2] = $217;
       $222 = $217 + 24 | 0;
       HEAP32[$222 >> 2] = $$3400;
       break;
      }
     }
    }
   }
  } while (0);
  $223 = $135 | 1;
  $224 = $$1 + 4 | 0;
  HEAP32[$224 >> 2] = $223;
  $225 = $113 + $135 | 0;
  HEAP32[$225 >> 2] = $135;
  $226 = HEAP32[756 >> 2] | 0;
  $227 = ($$1 | 0) == ($226 | 0);
  if ($227) {
   HEAP32[744 >> 2] = $135;
   return;
  } else {
   $$2 = $135;
  }
 } else {
  $228 = $115 & -2;
  HEAP32[$114 >> 2] = $228;
  $229 = $$1382 | 1;
  $230 = $$1 + 4 | 0;
  HEAP32[$230 >> 2] = $229;
  $231 = $113 + $$1382 | 0;
  HEAP32[$231 >> 2] = $$1382;
  $$2 = $$1382;
 }
 $232 = $$2 >>> 3;
 $233 = $$2 >>> 0 < 256;
 if ($233) {
  $234 = $232 << 1;
  $235 = 776 + ($234 << 2) | 0;
  $236 = HEAP32[184] | 0;
  $237 = 1 << $232;
  $238 = $236 & $237;
  $239 = ($238 | 0) == 0;
  if ($239) {
   $240 = $236 | $237;
   HEAP32[184] = $240;
   $$pre = $235 + 8 | 0;
   $$0403 = $235;
   $$pre$phiZ2D = $$pre;
  } else {
   $241 = $235 + 8 | 0;
   $242 = HEAP32[$241 >> 2] | 0;
   $243 = HEAP32[752 >> 2] | 0;
   $244 = $242 >>> 0 < $243 >>> 0;
   if ($244) {
    _abort(), asyncState ? abort(-12) | 0 : 0;
   } else {
    $$0403 = $242;
    $$pre$phiZ2D = $241;
   }
  }
  HEAP32[$$pre$phiZ2D >> 2] = $$1;
  $245 = $$0403 + 12 | 0;
  HEAP32[$245 >> 2] = $$1;
  $246 = $$1 + 8 | 0;
  HEAP32[$246 >> 2] = $$0403;
  $247 = $$1 + 12 | 0;
  HEAP32[$247 >> 2] = $235;
  return;
 }
 $248 = $$2 >>> 8;
 $249 = ($248 | 0) == 0;
 if ($249) {
  $$0396 = 0;
 } else {
  $250 = $$2 >>> 0 > 16777215;
  if ($250) {
   $$0396 = 31;
  } else {
   $251 = $248 + 1048320 | 0;
   $252 = $251 >>> 16;
   $253 = $252 & 8;
   $254 = $248 << $253;
   $255 = $254 + 520192 | 0;
   $256 = $255 >>> 16;
   $257 = $256 & 4;
   $258 = $257 | $253;
   $259 = $254 << $257;
   $260 = $259 + 245760 | 0;
   $261 = $260 >>> 16;
   $262 = $261 & 2;
   $263 = $258 | $262;
   $264 = 14 - $263 | 0;
   $265 = $259 << $262;
   $266 = $265 >>> 15;
   $267 = $264 + $266 | 0;
   $268 = $267 << 1;
   $269 = $267 + 7 | 0;
   $270 = $$2 >>> $269;
   $271 = $270 & 1;
   $272 = $271 | $268;
   $$0396 = $272;
  }
 }
 $273 = 1040 + ($$0396 << 2) | 0;
 $274 = $$1 + 28 | 0;
 HEAP32[$274 >> 2] = $$0396;
 $275 = $$1 + 16 | 0;
 $276 = $$1 + 20 | 0;
 HEAP32[$276 >> 2] = 0;
 HEAP32[$275 >> 2] = 0;
 $277 = HEAP32[740 >> 2] | 0;
 $278 = 1 << $$0396;
 $279 = $277 & $278;
 $280 = ($279 | 0) == 0;
 do {
  if ($280) {
   $281 = $277 | $278;
   HEAP32[740 >> 2] = $281;
   HEAP32[$273 >> 2] = $$1;
   $282 = $$1 + 24 | 0;
   HEAP32[$282 >> 2] = $273;
   $283 = $$1 + 12 | 0;
   HEAP32[$283 >> 2] = $$1;
   $284 = $$1 + 8 | 0;
   HEAP32[$284 >> 2] = $$1;
  } else {
   $285 = HEAP32[$273 >> 2] | 0;
   $286 = ($$0396 | 0) == 31;
   $287 = $$0396 >>> 1;
   $288 = 25 - $287 | 0;
   $289 = $286 ? 0 : $288;
   $290 = $$2 << $289;
   $$0383 = $290;
   $$0384 = $285;
   while (1) {
    $291 = $$0384 + 4 | 0;
    $292 = HEAP32[$291 >> 2] | 0;
    $293 = $292 & -8;
    $294 = ($293 | 0) == ($$2 | 0);
    if ($294) {
     label = 124;
     break;
    }
    $295 = $$0383 >>> 31;
    $296 = ($$0384 + 16 | 0) + ($295 << 2) | 0;
    $297 = $$0383 << 1;
    $298 = HEAP32[$296 >> 2] | 0;
    $299 = ($298 | 0) == (0 | 0);
    if ($299) {
     label = 121;
     break;
    } else {
     $$0383 = $297;
     $$0384 = $298;
    }
   }
   if ((label | 0) == 121) {
    $300 = HEAP32[752 >> 2] | 0;
    $301 = $296 >>> 0 < $300 >>> 0;
    if ($301) {
     _abort(), asyncState ? abort(-12) | 0 : 0;
    } else {
     HEAP32[$296 >> 2] = $$1;
     $302 = $$1 + 24 | 0;
     HEAP32[$302 >> 2] = $$0384;
     $303 = $$1 + 12 | 0;
     HEAP32[$303 >> 2] = $$1;
     $304 = $$1 + 8 | 0;
     HEAP32[$304 >> 2] = $$1;
     break;
    }
   } else if ((label | 0) == 124) {
    $305 = $$0384 + 8 | 0;
    $306 = HEAP32[$305 >> 2] | 0;
    $307 = HEAP32[752 >> 2] | 0;
    $308 = $306 >>> 0 >= $307 >>> 0;
    $not$437 = $$0384 >>> 0 >= $307 >>> 0;
    $309 = $308 & $not$437;
    if ($309) {
     $310 = $306 + 12 | 0;
     HEAP32[$310 >> 2] = $$1;
     HEAP32[$305 >> 2] = $$1;
     $311 = $$1 + 8 | 0;
     HEAP32[$311 >> 2] = $306;
     $312 = $$1 + 12 | 0;
     HEAP32[$312 >> 2] = $$0384;
     $313 = $$1 + 24 | 0;
     HEAP32[$313 >> 2] = 0;
     break;
    } else {
     _abort(), asyncState ? abort(-12) | 0 : 0;
    }
   }
  }
 } while (0);
 $314 = HEAP32[768 >> 2] | 0;
 $315 = $314 + -1 | 0;
 HEAP32[768 >> 2] = $315;
 $316 = ($315 | 0) == 0;
 if ($316) {
  $$0212$in$i = 1192;
 } else {
  return;
 }
 while (1) {
  $$0212$i = HEAP32[$$0212$in$i >> 2] | 0;
  $317 = ($$0212$i | 0) == (0 | 0);
  $318 = $$0212$i + 8 | 0;
  if ($317) {
   break;
  } else {
   $$0212$in$i = $318;
  }
 }
 HEAP32[768 >> 2] = -1;
 return;
}
function emterpret(pc) {
 pc = pc | 0;
 var sp = 0, inst = 0, lx = 0, ly = 0, lz = 0;
 var ld = 0.0;
 HEAP32[EMTSTACKTOP >> 2] = pc;
 sp = EMTSTACKTOP + 8 | 0;
 assert(HEAPU8[pc >> 0] >>> 0 == 140 | 0);
 lx = HEAPU16[pc + 2 >> 1] | 0;
 EMTSTACKTOP = EMTSTACKTOP + (lx + 1 << 3) | 0;
 assert((EMTSTACKTOP | 0) <= (EMT_STACK_MAX | 0) | 0);
 if ((asyncState | 0) != 2) {} else {
  pc = (HEAP32[sp - 4 >> 2] | 0) - 8 | 0;
 }
 pc = pc + 4 | 0;
 while (1) {
  pc = pc + 4 | 0;
  inst = HEAP32[pc >> 2] | 0;
  lx = inst >> 8 & 255;
  ly = inst >> 16 & 255;
  lz = inst >>> 24;
  switch (inst & 255) {
  case 0:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 1:
   HEAP32[sp + (lx << 3) >> 2] = inst >> 16;
   break;
  case 2:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[pc >> 2] | 0;
   break;
  case 3:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 4:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) - (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 13:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 15:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0) | 0;
   break;
  case 16:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] >>> 0 < HEAP32[sp + (lz << 3) >> 2] >>> 0 | 0;
   break;
  case 19:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 20:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | (HEAP32[sp + (lz << 3) >> 2] | 0);
   break;
  case 25:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) + (inst >> 24) | 0;
   break;
  case 32:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) == inst >> 24 | 0;
   break;
  case 34:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) < inst >> 24 | 0;
   break;
  case 38:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) & inst >> 24;
   break;
  case 39:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 | inst >> 24;
   break;
  case 41:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) << lz;
   break;
  case 42:
   HEAP32[sp + (lx << 3) >> 2] = (HEAP32[sp + (ly << 3) >> 2] | 0) >> lz;
   break;
  case 47:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) < (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 49:
   if ((HEAP32[sp + (ly << 3) >> 2] | 0) <= (HEAP32[sp + (lz << 3) >> 2] | 0)) {
    pc = pc + 4 | 0;
   } else {
    pc = HEAP32[pc + 4 >> 2] | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 82:
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[HEAP32[sp + (ly << 3) >> 2] >> 2];
   break;
  case 83:
   HEAP8[HEAP32[sp + (lx << 3) >> 2] >> 0] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 85:
   HEAP32[HEAP32[sp + (lx << 3) >> 2] >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0;
   break;
  case 119:
   pc = pc + (inst >> 16 << 2) | 0;
   pc = pc - 4 | 0;
   continue;
   break;
  case 120:
   if (HEAP32[sp + (lx << 3) >> 2] | 0) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 121:
   if (!(HEAP32[sp + (lx << 3) >> 2] | 0)) {
    pc = pc + (inst >> 16 << 2) | 0;
    pc = pc - 4 | 0;
    continue;
   }
   break;
  case 125:
   pc = pc + 4 | 0;
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[sp + (ly << 3) >> 2] | 0 ? HEAP32[sp + (lz << 3) >> 2] | 0 : HEAP32[sp + ((HEAPU8[pc >> 0] | 0) << 3) >> 2] | 0;
   break;
  case 130:
   switch (ly | 0) {
   case 0:
    {
     HEAP32[sp + (lx << 3) >> 2] = STACK_MAX;
     continue;
    }
   case 1:
    {
     HEAP32[sp + (lx << 3) >> 2] = DYNAMICTOP_PTR;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 132:
   switch (inst >> 8 & 255) {
   case 0:
    {
     STACK_MAX = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   case 1:
    {
     DYNAMICTOP_PTR = HEAP32[sp + (lz << 3) >> 2] | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 134:
   lz = HEAPU8[(HEAP32[pc + 4 >> 2] | 0) + 1 | 0] | 0;
   ly = 0;
   assert((EMTSTACKTOP + 8 | 0) <= (EMT_STACK_MAX | 0) | 0);
   if ((asyncState | 0) != 2) {
    while ((ly | 0) < (lz | 0)) {
     HEAP32[EMTSTACKTOP + (ly << 3) + 8 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) >> 2] | 0;
     HEAP32[EMTSTACKTOP + (ly << 3) + 12 >> 2] = HEAP32[sp + (HEAPU8[pc + 8 + ly >> 0] << 3) + 4 >> 2] | 0;
     ly = ly + 1 | 0;
    }
   }
   HEAP32[sp - 4 >> 2] = pc;
   emterpret(HEAP32[pc + 4 >> 2] | 0);
   if ((asyncState | 0) == 1) {
    EMTSTACKTOP = sp - 8 | 0;
    return;
   }
   HEAP32[sp + (lx << 3) >> 2] = HEAP32[EMTSTACKTOP >> 2] | 0;
   HEAP32[sp + (lx << 3) + 4 >> 2] = HEAP32[EMTSTACKTOP + 4 >> 2] | 0;
   pc = pc + (4 + lz + 3 >> 2 << 2) | 0;
   break;
  case 135:
   switch (inst >>> 16 | 0) {
   case 0:
    {
     HEAP32[sp - 4 >> 2] = pc;
     abortStackOverflow(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 1:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall146(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 2:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = FUNCTION_TABLE_iiii[HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] & 7](HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 6 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 7 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 3:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall140(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 4:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall54(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 5:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = abortOnCannotGrowMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 6:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___setErrNo(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 7:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = getTotalMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 8:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = enlargeMemory() | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     continue;
    }
   case 9:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = _emscripten_asm_const_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 10:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _emscripten_sleep(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 11:
    {
     HEAP32[sp - 4 >> 2] = pc;
     _emscripten_asm_const_v(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 12:
    {
     HEAP32[sp - 4 >> 2] = pc;
     lz = ___syscall6(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0, HEAP32[sp + (HEAPU8[pc + 5 >> 0] << 3) >> 2] | 0) | 0;
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     } else HEAP32[sp + (lx << 3) >> 2] = lz;
     pc = pc + 4 | 0;
     continue;
    }
   case 13:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___lock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 14:
    {
     HEAP32[sp - 4 >> 2] = pc;
     ___unlock(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 15:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_iiii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   case 16:
    {
     HEAP32[sp - 4 >> 2] = pc;
     nullFunc_ii(HEAP32[sp + (HEAPU8[pc + 4 >> 0] << 3) >> 2] | 0);
     if ((asyncState | 0) == 1) {
      EMTSTACKTOP = sp - 8 | 0;
      return;
     };
     pc = pc + 4 | 0;
     continue;
    }
   default:
    assert(0);
   }
   break;
  case 136:
   HEAP32[sp + (lx << 3) >> 2] = STACKTOP;
   break;
  case 137:
   STACKTOP = HEAP32[sp + (lx << 3) >> 2] | 0;
   break;
  case 139:
   EMTSTACKTOP = sp - 8 | 0;
   HEAP32[EMTSTACKTOP >> 2] = HEAP32[sp + (lx << 3) >> 2] | 0;
   HEAP32[EMTSTACKTOP + 4 >> 2] = HEAP32[sp + (lx << 3) + 4 >> 2] | 0;
   return;
   break;
  default:
   assert(0);
  }
 }
 assert(0);
}

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0, aligned_dest_end = 0, block_aligned_dest_end = 0, dest_end = 0;
 if ((num | 0) >= 8192) {
  return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 }
 ret = dest | 0;
 dest_end = dest + num | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  aligned_dest_end = dest_end & -4 | 0;
  block_aligned_dest_end = aligned_dest_end - 64 | 0;
  while ((dest | 0) <= (block_aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   HEAP32[dest + 4 >> 2] = HEAP32[src + 4 >> 2] | 0;
   HEAP32[dest + 8 >> 2] = HEAP32[src + 8 >> 2] | 0;
   HEAP32[dest + 12 >> 2] = HEAP32[src + 12 >> 2] | 0;
   HEAP32[dest + 16 >> 2] = HEAP32[src + 16 >> 2] | 0;
   HEAP32[dest + 20 >> 2] = HEAP32[src + 20 >> 2] | 0;
   HEAP32[dest + 24 >> 2] = HEAP32[src + 24 >> 2] | 0;
   HEAP32[dest + 28 >> 2] = HEAP32[src + 28 >> 2] | 0;
   HEAP32[dest + 32 >> 2] = HEAP32[src + 32 >> 2] | 0;
   HEAP32[dest + 36 >> 2] = HEAP32[src + 36 >> 2] | 0;
   HEAP32[dest + 40 >> 2] = HEAP32[src + 40 >> 2] | 0;
   HEAP32[dest + 44 >> 2] = HEAP32[src + 44 >> 2] | 0;
   HEAP32[dest + 48 >> 2] = HEAP32[src + 48 >> 2] | 0;
   HEAP32[dest + 52 >> 2] = HEAP32[src + 52 >> 2] | 0;
   HEAP32[dest + 56 >> 2] = HEAP32[src + 56 >> 2] | 0;
   HEAP32[dest + 60 >> 2] = HEAP32[src + 60 >> 2] | 0;
   dest = dest + 64 | 0;
   src = src + 64 | 0;
  }
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 } else {
  aligned_dest_end = dest_end - 4 | 0;
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   HEAP8[dest + 1 >> 0] = HEAP8[src + 1 >> 0] | 0;
   HEAP8[dest + 2 >> 0] = HEAP8[src + 2 >> 0] | 0;
   HEAP8[dest + 3 >> 0] = HEAP8[src + 3 >> 0] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 }
 while ((dest | 0) < (dest_end | 0)) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 }
 return ret | 0;
}

function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
 end = ptr + num | 0;
 value = value & 255;
 if ((num | 0) >= 67) {
  while ((ptr & 3) != 0) {
   HEAP8[ptr >> 0] = value;
   ptr = ptr + 1 | 0;
  }
  aligned_end = end & -4 | 0;
  block_aligned_end = aligned_end - 64 | 0;
  value4 = value | value << 8 | value << 16 | value << 24;
  while ((ptr | 0) <= (block_aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   HEAP32[ptr + 4 >> 2] = value4;
   HEAP32[ptr + 8 >> 2] = value4;
   HEAP32[ptr + 12 >> 2] = value4;
   HEAP32[ptr + 16 >> 2] = value4;
   HEAP32[ptr + 20 >> 2] = value4;
   HEAP32[ptr + 24 >> 2] = value4;
   HEAP32[ptr + 28 >> 2] = value4;
   HEAP32[ptr + 32 >> 2] = value4;
   HEAP32[ptr + 36 >> 2] = value4;
   HEAP32[ptr + 40 >> 2] = value4;
   HEAP32[ptr + 44 >> 2] = value4;
   HEAP32[ptr + 48 >> 2] = value4;
   HEAP32[ptr + 52 >> 2] = value4;
   HEAP32[ptr + 56 >> 2] = value4;
   HEAP32[ptr + 60 >> 2] = value4;
   ptr = ptr + 64 | 0;
  }
  while ((ptr | 0) < (aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (end | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return end - num | 0;
}

function ___stdout_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 1344 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_seek($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 1160 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___stdio_write($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = $1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = $2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 0 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b1(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  HEAP32[EMTSTACKTOP + 16 >> 2] = p1;
  HEAP32[EMTSTACKTOP + 24 >> 2] = p2;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 2308 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function establishStackSpace(stackBase, stackMax) {
 stackBase = stackBase | 0;
 stackMax = stackMax | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = stackBase;
  HEAP32[EMTSTACKTOP + 16 >> 2] = stackMax;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 2076 | 0);
}

function runPostSets() {}
function _sbrk(increment) {
 increment = increment | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = increment;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 1532 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 15 & -16;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(size | 0);
 return ret | 0;
}

function ___stdio_close($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 1852 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _fflush($0) {
 $0 = $0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = $0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 532 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function b0(p0) {
 p0 = p0 | 0;
 if ((asyncState | 0) != 2) {
  HEAP32[EMTSTACKTOP + 8 >> 2] = p0;
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 2364 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function _emscripten_get_global_libc() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 2168 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function ___errno_location() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 2040 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 7](a1 | 0, a2 | 0, a3 | 0) | 0;
}

function _main() {
 if ((asyncState | 0) != 2) {
  if ((asyncState | 0) == 1) asyncState = 3;
 }
 emterpret(eb + 1680 | 0);
 return HEAP32[EMTSTACKTOP >> 2] | 0;
}

function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}

function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 1](a1 | 0) | 0;
}

function emtStackSave() {
 asyncState ? abort(-12) | 0 : 0;
 return EMTSTACKTOP | 0;
}

function getTempRet0() {
 asyncState ? abort(-12) | 0 : 0;
 return tempRet0 | 0;
}

function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}

function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}

function emtStackRestore(x) {
 x = x | 0;
 EMTSTACKTOP = x;
}

function setAsyncState(x) {
 x = x | 0;
 asyncState = x;
}

function stackSave() {
 return STACKTOP | 0;
}

// EMSCRIPTEN_END_FUNCS

var FUNCTION_TABLE_ii = [b0,___stdio_close];
var FUNCTION_TABLE_iiii = [b1,b1,___stdout_write,___stdio_seek,___stdio_write,b1,b1,b1];

  return { _malloc: _malloc, getTempRet0: getTempRet0, _free: _free, _main: _main, setTempRet0: setTempRet0, establishStackSpace: establishStackSpace, stackSave: stackSave, _memset: _memset, _sbrk: _sbrk, _emscripten_get_global_libc: _emscripten_get_global_libc, _memcpy: _memcpy, stackAlloc: stackAlloc, setThrew: setThrew, _fflush: _fflush, stackRestore: stackRestore, ___errno_location: ___errno_location, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, establishStackSpace: establishStackSpace, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, emterpret: emterpret, setAsyncState: setAsyncState, emtStackSave: emtStackSave, emtStackRestore: emtStackRestore, dynCall_ii: dynCall_ii, dynCall_iiii: dynCall_iiii };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__malloc = asm["_malloc"];
asm["_malloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__malloc.apply(null, arguments);
});
var real_getTempRet0 = asm["getTempRet0"];
asm["getTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_getTempRet0.apply(null, arguments);
});
var real__free = asm["_free"];
asm["_free"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__free.apply(null, arguments);
});
var real__main = asm["_main"];
asm["_main"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__main.apply(null, arguments);
});
var real_setTempRet0 = asm["setTempRet0"];
asm["setTempRet0"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setTempRet0.apply(null, arguments);
});
var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_establishStackSpace.apply(null, arguments);
});
var real_stackSave = asm["stackSave"];
asm["stackSave"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackSave.apply(null, arguments);
});
var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__sbrk.apply(null, arguments);
});
var real__emscripten_get_global_libc = asm["_emscripten_get_global_libc"];
asm["_emscripten_get_global_libc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__emscripten_get_global_libc.apply(null, arguments);
});
var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackAlloc.apply(null, arguments);
});
var real_setThrew = asm["setThrew"];
asm["setThrew"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_setThrew.apply(null, arguments);
});
var real__fflush = asm["_fflush"];
asm["_fflush"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real__fflush.apply(null, arguments);
});
var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real_stackRestore.apply(null, arguments);
});
var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = (function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return real____errno_location.apply(null, arguments);
});
var _malloc = Module["_malloc"] = asm["_malloc"];
var getTempRet0 = Module["getTempRet0"] = asm["getTempRet0"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var setTempRet0 = Module["setTempRet0"] = asm["setTempRet0"];
var establishStackSpace = Module["establishStackSpace"] = asm["establishStackSpace"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var _memset = Module["_memset"] = asm["_memset"];
var _sbrk = Module["_sbrk"] = asm["_sbrk"];
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = asm["_emscripten_get_global_libc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var setThrew = Module["setThrew"] = asm["setThrew"];
var _fflush = Module["_fflush"] = asm["_fflush"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
Runtime.stackAlloc = Module["stackAlloc"];
Runtime.stackSave = Module["stackSave"];
Runtime.stackRestore = Module["stackRestore"];
Runtime.establishStackSpace = Module["establishStackSpace"];
Runtime.setTempRet0 = Module["setTempRet0"];
Runtime.getTempRet0 = Module["getTempRet0"];
Module["asm"] = asm;
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 var initialEmtStackTop = Module["asm"].emtStackSave();
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   Module["asm"].emtStackRestore(initialEmtStackTop);
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   Module.printErr("exception thrown: " + toLog);
   Module["quit"](1, e);
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 writeStackCookie();
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
   Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms");
  }
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
 checkStackCookie();
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)");
  return;
 }
 if (Module["noExitRuntime"]) {
  Module.printErr("exit(" + status + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)");
 } else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["exit"](status);
 }
 Module["quit"](status, new ExitStatus(status));
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
run();




