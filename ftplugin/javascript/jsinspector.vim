if exists('b:did_jsinspector_ftplugin')
  finish
endif
let b:did_jsinspector_ftplugin = 1

let s:save_cpo = &cpo
set cpo&vim


let b:jsinspector_searching = 0
let b:jsinspector_variable = ''
let b:jsinspector_positions = []

nnoremap <buffer><silent> <Space>* :call jsinspector#search()<CR>


let &cpo = s:save_cpo
unlet s:save_cpo
