(module
    (import "js" "tbl" (table 2 anyfunc))
    (func $f42 (result i32) i32.const 42) ;; () => 42
    (func $fecho (param $input i32) (result i32) (get_local $input)) ;; i => i
    (elem (i32.const 0) $f42 $fecho) ;; tbl = [$f42, $fecho]
)