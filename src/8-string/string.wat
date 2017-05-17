(module
  (func $fprint (import "imports" "print_ascii") (param i32)) ;; import print_ascii from Modules.imports.print_ascii
  (memory (export "mem") 1) ;; declare memory called mem
  (func (export "print_and_lower") (param $ptr i32) (param $len i32) ;; function acc = (ptr: i32, len: i32) -> ()
    (local $end i32) ;; int end;
    (local $tmp i32) ;; int tmp;
    (set_local $end (i32.add (get_local $ptr) (i32.mul (get_local $len) (i32.const 4)))) ;; end = ptr + len (1 == sizeof(int))

    (block $break (loop $top ;; loop do
      (br_if $break (i32.eq (get_local $ptr) (get_local $end))) ;; break if ptr == end
        (set_local $tmp (i32.load8_u (get_local $ptr))) ;; tmp = mem[i];
        (get_local $tmp) call $fprint ;; console.log(mem[i])
        (i32.store (get_local $ptr) (i32.add (get_local $tmp) (i32.const 32))) ;; mem[i] = mem[i] + 32
        (set_local $ptr (i32.add (get_local $ptr) (i32.const 4))) ;; ptr = ptr + 4
        (br $top) ;; continue
    ))
  )
)
