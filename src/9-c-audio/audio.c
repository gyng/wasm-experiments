#include <emscripten/emscripten.h>

// https://kripken.github.io/emscripten-site/docs/api_reference/emscripten.h.html#emterpreter-async-functions
// emcc audio.c -s EMTERPRETIFY=1 -s EMTERPRETIFY_ASYNC=1 -o audio.html
int EMSCRIPTEN_KEEPALIVE main() {
  int i = 200;

  EM_ASM_({
    const context = new AudioContext;
    window.oscillator = context.createOscillator();
    window.oscillator.frequency.value = $0;
    window.oscillator.connect(context.destination);
    window.oscillator.start(0);
  }, i);

  for (; i < 2000; i++) {
    EM_ASM_({
      window.oscillator.frequency.value = $0;
    }, i);
    emscripten_sleep(10);
  }

  EM_ASM({
    window.oscillator.stop(0);
  });

  return 0;
}
