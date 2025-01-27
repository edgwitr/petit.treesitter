" filetype on
filetype plugin indent on

" termguicolors
set termguicolors
set incsearch
set hlsearch

" Syntax groups
highlight Normal guibg=#1e1e1e guifg=#d4d4d4 ctermbg=Black ctermfg=15
highlight Search ctermbg=Yellow ctermfg=Black guibg=#EFBB24 guifg=#1e1e1e
highlight Cursor guibg=#d4d4d4 guifg=#1e1e1e ctermbg=15 ctermfg=Black
highlight tsERROR guibg=#f44747 guifg=NONE ctermfg=Red
highlight tsKeyword guifg=#C586C0 gui=bold ctermfg=LightMagenta
highlight tsFunction guifg=#DCDCAA gui=NONE ctermfg=Yellow
highlight tsMethod guifg=#DCDCAA gui=NONE ctermfg=Yellow
highlight tsParameter guifg=#9CDCFE gui=NONE ctermfg=Cyan
highlight tsVariable guifg=#9CDCFE gui=NONE ctermfg=Cyan
highlight tsFormat guifg=#9CDCFE gui=NONE ctermfg=Cyan
highlight tsConstant guifg=#4FC1FF gui=NONE ctermfg=Blue
highlight tsString guifg=#CE9178 gui=NONE ctermfg=DarkRed
highlight tsEscape guifg=#D7BA7D gui=NONE ctermfg=DarkYellow
highlight tsNumber guifg=#B5CEA8 gui=NONE ctermfg=LightGray
highlight tsBoolean guifg=#569CD6 gui=bold
highlight tsComment guifg=#6A9955 gui=italic ctermfg=DarkGreen
highlight tsOperator guifg=#D4D4D4 gui=NONE
highlight tsType guifg=#4EC9B0 gui=NONE ctermfg=Green
highlight tsField guifg=#9CDCFE gui=NONE ctermfg=Cyan
highlight tsProperty guifg=#9CDCFE gui=NONE ctermfg=Cyan
highlight tsNamespace guifg=#4EC9B0 gui=bold ctermfg=Green
highlight tsConditional guifg=#569CD6 gui=bold ctermfg=DarkBlue
highlight tsRepeat guifg=#569CD6 gui=bold ctermfg=DarkBlue
highlight tsLabel guifg=#D7BA7D gui=NONE ctermfg=DarkYellow

" " Diagnostics (for LSP or other integrations)
" highlight DiagnosticError guifg=#F44747 gui=bold
" highlight DiagnosticWarn guifg=#FF8800 gui=bold
" highlight DiagnosticInfo guifg=#4FC1FF gui=bold
" highlight DiagnosticHint guifg=#B5CEA8 gui=italic

" Git signs (if using a plugin like gitsigns.nvim)
highlight GitSignsAdd guifg=#4EC9B0 gui=NONE
highlight GitSignsChange guifg=#D7BA7D gui=NONE
highlight GitSignsDelete guifg=#F44747 gui=NONE

" Treesitter groups for brackets and tags (for plugins like nvim-ts-rainbow)
highlight TSRainbowRed guifg=#D16969 gui=NONE
highlight TSRainbowYellow guifg=#DCDCAA gui=NONE
highlight TSRainbowBlue guifg=#569CD6 gui=NONE
highlight TSRainbowOrange guifg=#FF8800 gui=NONE
highlight TSRainbowGreen guifg=#4EC9B0 gui=NONE
highlight TSRainbowViolet guifg=#C586C0 gui=NONE
highlight TSRainbowCyan guifg=#9CDCFE gui=NONE

" " Terminal colors (optional, for consistency with theme)
" highlight TermCursor guibg=#D4D4D4 guifg=#1E1E1E
" highlight TermCursorNC guibg=#D4D4D4 guifg=#1E1E1E
