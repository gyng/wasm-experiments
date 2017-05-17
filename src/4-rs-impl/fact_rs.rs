// rustc --target=wasm32-unknown-emscripten fact_rs.rs -O -o fact_rs.html
//
// i32 to be equiv to C version
// checked_mult to detect overflow!
//
// >> Module._fact_rs(12)
// -> 5261360
//
// >> Module._fact_rs(13)
// -> Unwind_GetIPInfo (...)

/* js
var start = performance.now();

for (let i = 0; i < 1000000; i++) {
  Module._fact_rs(12);
}

var end = performance.now();
console.log(end - start, 'ms');
*/

#[no_mangle]
pub fn fact_rs(n: i32) -> i32 {
  if n == 0 {
    return 1;
  }

  // n * fact_rs(n - 1)
  n.checked_mul(fact_rs(n - 1)).unwrap() // panic if overflow!
}

/* js
var start = performance.now();

for (let i = 0; i < 1000000; i++) {
  Module._count_ones_rs(i);
}

var end = performance.now();
console.log(end - start, 'ms');
*/

#[no_mangle]
pub fn count_ones_rs(n: i32) -> u32 {
  n.count_ones()
}

fn main() {
  println!("Hello, world!");
}
