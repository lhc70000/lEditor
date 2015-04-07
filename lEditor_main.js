function getRange() {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            return range;
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        return range;
    }
}

function setBasicStyle(type) {
    var el = document.createElement(type);
    var r = getRange();
    var node = r.startContainer;
    console.log($(node).next());
    //var s = r.toString();
    r.deleteContents();
    el.appendChild(document.createTextNode(s));
    r.insertNode(el);
}

