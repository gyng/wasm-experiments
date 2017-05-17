// emcc fact_c.c -s WASM=1 -O2 -o fact_c.html
//
// >> Module._fact_c(5)
// <- 120
//
// ./wabt/wasm2wast src/3-c-impl/fact_c.wasm > src/3-c-impl/fact_c.wast

/* js
var start = performance.now();

for (let i = 0; i < 1000000; i++) {
  Module._fact_c(12);
}

var end = performance.now();
console.log(end - start, 'ms');
*/

#include <emscripten/emscripten.h>

int EMSCRIPTEN_KEEPALIVE fact_c(int n) {
  if (n == 0) {
    return 1;
  }

  return n * fact_c(n - 1);
}

/* js
var start = performance.now();

for (let i = 0; i < 1000000; i++) {
  Module._count_ones_c(i);
}

var end = performance.now();
console.log(end - start, 'ms');
*/

int EMSCRIPTEN_KEEPALIVE count_ones_c(int n) {
  return __builtin_popcount(n);
}
