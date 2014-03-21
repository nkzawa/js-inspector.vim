let s:save_cpo = &cpo
set cpo&vim


nmap <silent> <Plug>JsInspectorSearchForward :call jsinspector#search#forward()<CR>
nmap <silent> <Plug>JsInspectorSearchNext :call jsinspector#search#next()<CR>
nmap <silent> <Plug>JsInspectorSearchPrev :call jsinspector#search#prev()<CR>

command! -bar JsInspectorSearchClear :call jsinspector#search#clear()


let &cpo = s:save_cpo
unlet s:save_cpo
