let s:save_cpo = &cpo
set cpo&vim


function! jsinspector#keymaps()
  autocmd FileType javascript nmap <buffer> <LocalLeader>* <Plug>JsInspectorSearchForward

  autocmd User JsInspectorSearchEnter nmap <buffer> n <Plug>JsInspectorSearchNext
  autocmd User JsInspectorSearchEnter nmap <buffer> N <Plug>JsInspectorSearchPrev
  autocmd User JsInspectorSearchEnter nnoremap <buffer> * :JsInspectorSearchClear<CR>*
  autocmd User JsInspectorSearchEnter nnoremap <buffer> # :JsInspectorSearchClear<CR>#
  autocmd User JsInspectorSearchEnter nnoremap <buffer> / :JsInspectorSearchClear<CR>/
  autocmd User JsInspectorSearchEnter nnoremap <buffer> ? :JsInspectorSearchClear<CR>?

  autocmd User JsInspectorSearchLeave nunmap <buffer> n
  autocmd User JsInspectorSearchLeave nunmap <buffer> N
  autocmd User JsInspectorSearchLeave nunmap <buffer> *
  autocmd User JsInspectorSearchLeave nunmap <buffer> #
  autocmd User JsInspectorSearchLeave nunmap <buffer> /
  autocmd User JsInspectorSearchLeave nunmap <buffer> ?
endfunction


let &cpo = s:save_cpo
unlet s:save_cpo
