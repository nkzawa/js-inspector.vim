js-inspector.vim
================

A Vim plugin for support JavaScript code development based on AST analysis.


## Installation
Use your preferred installation method.

#### [Vundle](https://github.com/gmarik/Vundle.vim)

```vim
Bundle 'nkzawa/js-inspector.vim'
```

#### [Pathogen](https://github.com/tpope/vim-pathogen)

```sh
cd ~/.vim/bundle
git clone git://github.com/nkzawa/js-inspector.vim.git
```

### Dependencies

- [Node.js](http://nodejs.org) v0.10 or later

Make sure the `node` command is in your `PATH`.

## Basic Usage
Add the following to your `~/.vimrc` to enable default key mappings .

```vim
call jsinspector#keymaps()
```

Then open a JavaScript file:

- Press `<LocalLeader>*` or `<LocalLeader>#` to search the variable nearest to the cursor.
- Press `n` or `N` to repeat searching.
- Enter Insert mode and edit the variale to rename.
- Run `:JsInspectorSearchClear` to stop highlighting for search.

## License

MIT
