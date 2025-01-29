function! petit#treesitter#setup(config = {})

  let s:plugin_path = expand('<script>:p:h:h:h') . "/typescript"
  if index(split(&runtimepath, ','), s:plugin_path) == -1
    let &runtimepath .= ',' . s:plugin_path
  endif

  let s:config = a:config
  augroup TreesitterPetit
    autocmd!
    autocmd User DenopsPluginPost:treesitter-petit call denops#request('treesitter-petit', 'setup', [s:config])
  augroup END

endfunction
