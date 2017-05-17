	.section	__TEXT,__text,regular,pure_instructions
	.macosx_version_min 10, 11
	.globl	_fact_c
	.align	4, 0x90
_fact_c:                                ## @fact_c
	.cfi_startproc
## BB#0:
	pushq	%rbp
Ltmp0:
	.cfi_def_cfa_offset 16
Ltmp1:
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
Ltmp2:
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	%edi, -8(%rbp)
	cmpl	$0, -8(%rbp)
	jne	LBB0_2
## BB#1:
	movl	$1, -4(%rbp)
	jmp	LBB0_3
LBB0_2:
	movl	-8(%rbp), %eax
	movl	-8(%rbp), %ecx
	subl	$1, %ecx
	movl	%ecx, %edi
	movl	%eax, -12(%rbp)         ## 4-byte Spill
	callq	_fact_c
	movl	-12(%rbp), %ecx         ## 4-byte Reload
	imull	%eax, %ecx
	movl	%ecx, -4(%rbp)
LBB0_3:
	movl	-4(%rbp), %eax
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc

	.globl	_main
	.align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## BB#0:
	pushq	%rbp
Ltmp3:
	.cfi_def_cfa_offset 16
Ltmp4:
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
Ltmp5:
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movl	$0, -4(%rbp)
	movl	%edi, -8(%rbp)
	movq	%rsi, -16(%rbp)
	movq	-16(%rbp), %rsi
	movq	8(%rsi), %rdi
	callq	_atoi
	movl	%eax, -20(%rbp)
	movl	-20(%rbp), %edi
	callq	_fact_c
	leaq	L_.str(%rip), %rdi
	movl	%eax, %esi
	movb	$0, %al
	callq	_printf
	xorl	%esi, %esi
	movl	%eax, -24(%rbp)         ## 4-byte Spill
	movl	%esi, %eax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc

	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"%d"


.subsections_via_symbols
