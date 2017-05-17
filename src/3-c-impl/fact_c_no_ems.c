/*
Compile

    cc fact_c_no_ems.c -o fact_c_no_ems.out

View assembly with (g)objdump (binutils)

    objdump -d -M intel -S fact_c_no_ems.out

Or directly with gcc

    gcc -O2 -S fact_c_no_ems.c
*/

#include <stdio.h>
#include <stdlib.h>

int fact_c(int n) {
  if (n == 0) {
    return 1;
  }

  return n * fact_c(n - 1);
}

int main(int argc, char *argv[]) {
  int i = atoi(argv[1]);
  printf("%d", fact_c(i));
  return 0;
}
