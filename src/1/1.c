// emcc hello.c -s WASM=1 -o 1.html

#include <stdio.h>

int main(int argc, char ** argv) {
    printf("Hello, World\n");
    return 0;
}
