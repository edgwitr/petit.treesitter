function! petit#treesitter#setup()
  let s:plugin_path = expand('<script>:p:h:h:h') . "/typescript"

  if index(split(&runtimepath, ','), s:plugin_path) == -1
    let &runtimepath .= ',' . s:plugin_path
  endif
endfunction
