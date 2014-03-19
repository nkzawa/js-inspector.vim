let s:save_cpo = &cpo
set cpo&vim

let g:jsinspector_node = get(g:, 'jsinspector_node', 'node')

let s:script = simplify(expand('<sfile>:p:h') . '/../index.js')


function! jsinspector#search()
  let src = join(getline(1, '$'), "\n")
  let pos = getpos('.')
  let cmd = printf('%s %s %d %d',
      \ shellescape(g:jsinspector_node), shellescape(s:script), pos[1], pos[2] - 1)

  " clear highlights
  let @/ = ''
  call clearmatches()

  let json_str = system(cmd, src)
  if v:shell_error
    echoe json_str
    return
  endif

  let data = eval(json_str)
  call s:match(data.name, data.positions)
  call jsinspector#next()

  if b:jsinspector_searching
    return
  endif

  let b:jsinspector_searching = 1
  nnoremap <buffer><silent> n :call jsinspector#next()<CR>
  nnoremap <buffer><silent> N :call jsinspector#prev()<CR>
  nnoremap <buffer> * :call jsinspector#clear()<CR>*
  nnoremap <buffer> # :call jsinspector#clear()<CR>#
  nnoremap <buffer> / :call jsinspector#clear()<CR>/
  nnoremap <buffer> ? :call jsinspector#clear()<CR>?

  augroup rename_variable
    autocmd!
    autocmd CursorMovedI <buffer> :call jsinspector#rename()
    "autocmd InsertLeave <buffer> :call jsinspector#rename_and_clear()
    autocmd InsertLeave <buffer> :call jsinspector#rename()
  augroup END
endfunction

function! jsinspector#clear()
  if !b:jsinspector_searching
    return
  endif
  let b:jsinspector_searching = 0

  call clearmatches()
  nunmap <buffer> n
  nunmap <buffer> N
  nunmap <buffer> *
  nunmap <buffer> #
  nunmap <buffer> /
  nunmap <buffer> ?

  augroup! rename_variable
endfunction

function! jsinspector#next()
  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]
  let i = 0
  let positions = b:jsinspector_positions

  " find next position
  for pos in positions
    if (line == pos[0] && column < pos[1]) || line < pos[0]
      break
    endif
    let i += 1
  endfor

  " calculate numbers to skip
  let len = len(positions)
  let i = (i + v:count1 - 1) % len
  call s:move_to(i)
endfunction

function! jsinspector#prev()
  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]
  let i = 0
  let positions = reverse(copy(b:jsinspector_positions))

  " find prev position
  for pos in positions
    if (line == pos[0] && column > pos[1]) || line > pos[0]
      break
    endif
    let i += 1
  endfor

  " calculate numbers to skip
  let len = len(positions)
  let i = (i + v:count1 - 1) % len
  call s:move_to(len - i - 1)
endfunction

function! jsinspector#rename()
  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]

  for p in b:jsinspector_positions
    if p[0] != line || p[1] > column
      continue
    endif

    " extract variable name
    let name = matchstr(getline(line)[(p[1] - 1):], '^[0-9a-zA-Z_$]*')
    if name ==# b:jsinspector_variable
      return
    endif

    let positions = copy(b:jsinspector_positions)
    call remove(positions, index(positions, p))
    let patterns = map(positions, 's:search_pattern(b:jsinspector_variable, v:val)')

    if !empty(patterns)
      silent execute printf('%%s/%s/%s/g', join(patterns, '\|'), name)
      call setpos('.', pos)
    endif
    call s:match(name, b:jsinspector_positions)
    return
  endfor
endfunction

function! jsinspector#rename_and_clear()
  call jsinspector#rename()
  call jsinspector#clear()
endfunction

function! s:match(name, positions)
  let b:jsinspector_variable = a:name
  let b:jsinspector_positions = a:positions

  call clearmatches()
  for pos in a:positions
    call matchadd('Search', s:search_pattern(a:name, pos))
  endfor
endfunction

function! s:move_to(i)
  let pos = b:jsinspector_positions[a:i]
  call setpos('.', [0, pos[0], pos[1], 0])
  " refresh for the case when scrolling
  redraw
  echo printf('%s (%d/%d)', b:jsinspector_variable, a:i + 1, len(b:jsinspector_positions))
endfunction

function! s:search_pattern(name, pos)
  return printf('\%%%dl\%%>%dc\%%<%dc%s',
      \ a:pos[0], a:pos[1] - 1, a:pos[1] + 1, escape(a:name, '$'))
endfunction


let &cpo = s:save_cpo
unlet s:save_cpo
