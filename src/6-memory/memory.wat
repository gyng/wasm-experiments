(module
  (memory (export "mem") 1) ;; declare memory called mem
  (func (export "accumulate") (param $ptr i32) (param $len i32) (result i32) ;; function acc = (ptr: i32, len: i32) -> i32
    (local $end i32) ;; local variable end
    (local $sum i32) ;; local variable sum
    (set_local $end (i32.add (get_local $ptr) (i32.mul (get_local $len) (i32.const 4)))) ;; end = ptr + len * 4    (4 == sizeof(i32))
    (block $break (loop $top ;; loop do
      (br_if $break (i32.eq (get_local $ptr) (get_local $end))) ;; break if ptr == end
      (set_local $sum (i32.add (get_local $sum) ;; sum = sum + *ptr
                               (i32.load (get_local $ptr))))
        (set_local $ptr (i32.add (get_local $ptr) (i32.const 4))) ;; ptr = ptr + 4
        (br $top) ;; continue
    ))
    (get_local $sum) ;; return sum
  )
)
