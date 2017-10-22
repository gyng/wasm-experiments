# wasm experiments

Experiments in wasm with C and Rust. Factorial is slower, but counting bits is faster.

## Usage

### Rust

```
# Install
curl https://sh.rustup.rs -sSf | sh
rustup install stable
rustup default stable
rustup target add wasm32-unknown-emscripten

# Compile
rustc --target=wasm32-unknown-emscripten fact_rs.rs -O -o fact_rs.html
```

### C

**[From MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm)**

```
# Install
git clone https://github.com/juj/emsdk.git
cd emsdk

./emsdk install --build=Release sdk-incoming-64bit binaryen-master-64bit
./emsdk activate --global --build=Release sdk-incoming-64bit binaryen-master-64bit

# Compile
emcc fact_c.c -s WASM=1 -O2 -o fact_c.html
```

## References

* https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts
* https://hackernoon.com/compiling-rust-to-webassembly-guide-411066a69fde
* http://www.hellorust.com/emscripten/
* https://github.com/WebAssembly/wabt
* https://github.com/mdn/webassembly-examples
* https://github.com/WebAssembly/spec/tree/master/interpreter/#s-expression-syntax
* https://www.youtube.com/watch?v=6v4E6oksar0
* https://www.ecma-international.org/ecma-262/5.1/
* https://lord.io/blog/2017/wargo/
