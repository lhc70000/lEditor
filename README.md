# lEditor
A clean text editor.

# version
## 0.1.0
Initial version. Basic support on text format.

# usage
first include `lEditor.js` and `lEditor.css`

then add one more line:

`$(a-div).lEditor();`

or add some options:

`$(a-div).lEditor({
  height: '300px',
  color: '#ff0'
});`

possible options:

- `height`: height of the editor. e.g.`300px`

- `font`: initial font. e.g.`Microft YaHei`. The default font is `Simsun`.

- `font_size`: initial font size, from 1-7. The default is 4.

- `color`: initial text color. The default is `#000`.

- `bg_zolor`: initial text background color. The default is `#fff`.


