let s:save_cpo = &cpo
set cpo&vim


let s:script = simplify(expand('<sfile>:p:h') . '/../../index.js')

function! jsinspector#search#forward()
  call s:search(0)
endfunction

function! jsinspector#search#backward()
  call s:search(1)
endfunction

function! jsinspector#search#clear()
  if !get(b:, 'jsinspector_searching') | return | endif

  let b:jsinspector_searching = 0
  let b:jsinspector_search_opposite = 0
  let b:jsinspector_search_variable = ''
  let b:jsinspector_search_positions = []

  call clearmatches()

  augroup rename_variable
    autocmd!
  augroup END
  augroup! rename_variable

  doautocmd User JsInspectorSearchLeave
endfunction

function! jsinspector#search#next()
  if !get(b:, 'jsinspector_searching') | return | endif

  if b:jsinspector_search_opposite
    call s:backward()
  else
    call s:forward()
  endif
endfunction

function! jsinspector#search#prev()
  if !get(b:, 'jsinspector_searching') | return | endif

  if b:jsinspector_search_opposite
    call s:forward()
  else
    call s:backward()
  endif
endfunction

function! jsinspector#search#rename()
  if !get(b:, 'jsinspector_searching') | return | endif

  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]
  let length = len(b:jsinspector_search_variable)

  for p in b:jsinspector_search_positions
    if p[0] != line || p[1] > column || (p[1] + length + 1) < column
      continue
    endif

    " extract variable name
    let name = matchstr(getline(line)[(p[1] - 1):], '^[0-9a-zA-Z_$]*')
    if name ==# b:jsinspector_search_variable
      return
    endif

    if len(b:jsinspector_search_positions) > 1
      let offset = len(name) - length
      let positions = deepcopy(b:jsinspector_search_positions)
      call remove(positions, index(positions, p))

      for _p in positions
        if _p[0] != p[0]
          continue
        endif

        if _p[1] > p[1]
          " adjust positions for substitute
          let _p[1] += offset
        elseif _p[1] < p[1]
          " calculate the new cursor position
          let pos[2] += offset
        endif
      endfor

      let patterns = map(positions, 's:search_pattern(b:jsinspector_search_variable, v:val)')
      silent execute printf('%%s/%s/%s/g', join(patterns, '\|'), name)
      call setpos('.', pos)
    endif

    call s:renamed(name)
    call s:match(name, b:jsinspector_search_positions)
    return
  endfor
endfunction

function! jsinspector#search#rename_and_clear()
  call jsinspector#search#rename()
  call jsinspector#search#clear()
endfunction

function! s:search(opposite)
  let node = get(g:, 'jsinspector_node', 'node')
  let src = join(getline(1, '$'), "\n")
  let pos = getpos('.')
  let cmd = printf('%s %s %d %d',
      \ shellescape(node), shellescape(s:script), pos[1], pos[2] - 1)

  " clear highlights
  let @/ = ''
  call clearmatches()
  call jsinspector#search#clear()

  let json_str = system(cmd, src)
  if v:shell_error
    echoe json_str
    return
  endif

  let data = eval(json_str)

  let b:jsinspector_searching = 1
  let b:jsinspector_search_opposite = a:opposite
  let b:jsinspector_search_variable = data.name
  let b:jsinspector_search_positions = data.positions

  call s:match(data.name, data.positions)
  call jsinspector#search#next()

  augroup rename_variable
    autocmd!
    autocmd CursorMovedI <buffer> :call jsinspector#search#rename()
    autocmd InsertLeave <buffer> :call jsinspector#search#rename_and_clear()
  augroup END

  doautocmd User JsInspectorSearchEnter
endfunction

function! s:forward()
  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]
  let i = 0
  let positions = b:jsinspector_search_positions

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

function! s:backward()
  let pos = getpos('.')
  let line = pos[1]
  let column = pos[2]
  let i = 0
  let positions = reverse(copy(b:jsinspector_search_positions))

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

function! s:match(name, positions)
  call clearmatches()
  for pos in a:positions
    call matchadd('Search', s:search_pattern(a:name, pos))
  endfor
endfunction

function! s:move_to(i)
  let pos = b:jsinspector_search_positions[a:i]
  call setpos('.', [0, pos[0], pos[1], 0])
  " refresh for the case when scrolling
  redraw
  echo printf('%s (%d/%d)', b:jsinspector_search_variable, a:i + 1, len(b:jsinspector_search_positions))
endfunction

function! s:search_pattern(name, pos)
  return printf('\%%%dl\%%>%dc\%%<%dc%s',
      \ a:pos[0], a:pos[1] - 1, a:pos[1] + 1, escape(a:name, '$'))
endfunction

function! s:renamed(name)
  let margin = len(a:name) - len(b:jsinspector_search_variable)
  let b:jsinspector_search_variable = a:name
  let line = 0
  let offset = 0

  for p in b:jsinspector_search_positions
    if p[0] != line
      " on a new line
      let line = p[0]
      let offset = 0
    else
      let offset += margin
      let p[1] += offset
    endif
  endfor
endfunction


let &cpo = s:save_cpo
unlet s:save_cpo
