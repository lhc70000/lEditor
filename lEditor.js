/**
 * lEditor
 * v 0.5.5
 * by lhc (lhc199652@gmail.com)
 */

(function (window, document, undefined) {
    
    var version = '0.5.5';
    
    /* presets for fonts */
    var fonts = {
        '宋体': 'SimSun',
        '微软雅黑': 'Microsoft YaHei',
        '楷体': 'KaiTi',
        'Arial': 'Arial',
        'Comic Sans': 'Comic Sans MS',
        'Courier New': 'Courier New',
        'Georgia': 'Georgia',
        'Times New Roman': 'Times New Roman',
        'Verdana': 'Verdana',
    };
    
    /* presets for font sizes */
    var fontSizes = {
        1: '10px',
        2: '13px',
        3: '16px',
        4: '19px',
        5: '22px',
        6: '25px',
        7: '28px'
    };
    
    /* presets for colors */
    var colors = [
        '#fff', '#bbb', '#999', '#555', '#000', 
        '#f00', '#ff8000', '#ff0', '#80ff00', '#0f0', '#00ff80', '#0ff', '#0080ff', '#00f',
        '#800', '#884400', '#880', '#448800', '#080', '#008844', '#088', '#004488', '#008'
    ];
    
    var headings = {
        'H1': 'h1', 
        'H2': 'h2',
        'H3': 'h3',
        'H4': 'h4',
        'H5': 'h5',
        'H6': 'h6'
    };
    
    /* other initialization */
    // add startsWith method to String
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.indexOf(str) == 0;
        };
    }
    
    /* builders for buttons and button groups */
    var builders = {
        // builder for button groups
        buttonGroup: function (buttonArray) {
            var lbuttonGroup = $('<div class="lEditor-button-group"></div>');
            for (var btn in buttonArray) {
                lbuttonGroup.append(buttonArray[btn]);
            }
            return lbuttonGroup;
        },
        // builder for buttons
        button: function (icon) {
            var lbutton = $('<div class="lEditor-button" unselectable="on"></div>'),
                licon = $('<i class="fa fa-' + icon + '" unselectable="on"></i>');
            lbutton.append(licon);
            return lbutton;
        },
        // builder for drop down menu
        dropDownMenu: function (opValue, width) {
            var fontPickerText = $('<div class="lEditor-font-text" style="width: '+width+';">'+opValue+'</div>'),
                fontPickerButton = $('<div class="lEditor-button"></div>'),
                fontPickerIcon = $('<i class="fa fa-angle-down"></i>');
            fontPickerButton.append(fontPickerText).append(fontPickerIcon).css('text-align', 'left');
            return fontPickerButton;
        },
        // builder for color picker
        colorPicker: function (icon, type, color) {
            var lbutton = $('<div class="lEditor-button"></div>'),
                licon = $('<i class="fa fa-' + icon + '"></i>');
            lbutton.css('color', color);
            lbutton.append(licon);
            return lbutton;
        },
        // builder for tabs
        tab: function (title, active) {
            var ltag = $('<div class="lEditor-tab '+active+'">'+title+'</div>');
            return ltag;
        }
    };
    
    /* other functions */
    var utils = {
        insertHTML: function (window, document, html) {
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Range.createContextualFragment() would be useful here but is
                    // non-standard and not supported in all browsers (IE9, for one)
                    var el = document.createElement("div");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ( (node = el.firstChild) ) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (document.selection && document.selection.type != "Control") {
                // IE < 9
                document.selection.createRange().pasteHTML(html);
            }
        }
    };
    
    /* jQuery extention */
    jQuery.fn.extend({
        lEditor: function (options) {
            /* options handling*/
            options = options || [];
            var opHeight = options.height || '200px',
                opFont = options.font || 'Arial',
                opFontSize = options.font_size || 4,
                opColor = options.color || '#000',
                opBgColor = options.bg_color || '#fff',
                opToolBar = options.toolbar || ['undo', 'heading', 'font', 'style', 'color', 'align', 'list', 'link', 'media', 'textblock', 'remove'],
                opFullScreen = options.full_screen || false,
                opExitFullScreen = options.exit_full_screen || false, // private
                opFatherDocument = options.father_document || undefined, // private
                opText = options.text || '',
                opCallback = options.callback || undefined,
                opButtonSize = options.button_size || undefined,
                opFrameBgColor = options.textarea_bg_color || undefined,
                opToolBarBgColor = options.toolbar_bg_color || undefined,
                opToolBarColor = options.toolbar_color || undefined,
                opTab = options.tab || 'on',
                opAbout = options.about || 'off';
            
            /* build container */
            var lcontainer;
            lcontainer = $('<div class="lEditor-container" width="100%" style="height:' + opHeight + '"></div>');
            this.append(lcontainer);
            
            /* build toolbar */
            var ltoobar = $('<div class="lEditor-toolbar" width="100%"></div>'),
                lbuttonFullScreen,
                lbuttonUndo, lbuttonRepeat,
                lheadingPicker, lfontPicker, lfontSizePicker,
                lbuttonBold, lbuttonItalic, lbuttonUnderline, lbuttonStrike,
                lbuttonColor, lbuttonBgColor,
                lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight,
                lbuttonOl, lbuttonUl,
                lbuttonLink, lbuttonDelLink,
                lbuttonImage, 
                lbuttonHr, lbuttonQuote, lbuttonCode,
                lbuttonRemoveFormat, lbuttonCLear,
                lbuttonGithub, lbuttonMail,
                ltabContainer,
                ltabStart, ltabInsert, ltabAbout,
                ltabpageStart, ltabpageInsert, ltabpageAbout,
                // whether button group exist
                btnExist = {
                    undo: false,
                    heading: false,
                    font: false,
                    style: false,
                    color: false,
                    align: false,
                    list: false,
                    link:false,
                    media: false,
                    textblock: false,
                    remove: false
                };
            
            /* - full screen button */
            if (opFullScreen) {
                if (opExitFullScreen)
                    lbuttonFullScreen = builders.button('compress');
                else
                    lbuttonFullScreen = builders.button('expand');
                // its position should adjust based on whether tab is on
                if (opTab == 'on') {
                    lbuttonFullScreen.css({
                        'float': 'right',
                        'margin-top': '20px'
                    });
                } else {
                    lbuttonFullScreen.css('float', 'right');
                }
                ltoobar.append(lbuttonFullScreen);
            }
            
            /* - tab */
            if (opTab == 'on') {
                ltabContainer = $('<div class="lEditor-tab-container"></div>');
                ltabStart = builders.tab('Start', 'lEditor-tab-active');
                ltabInsert = builders.tab('Insert', '');
                ltabpageStart = $('<div class="lEditor-tab-page"></div>');
                ltabpageInsert = $('<div class="lEditor-tab-page"></div>');
                ltabpageInsert.hide();
                ltabContainer.append(ltabStart).append(ltabInsert);
                // if show about tab
                if (opAbout == 'on') {
                    ltabAbout = builders.tab('About', '');
                    ltabpageAbout = $('<div class="lEditor-tab-page"></div');
                    var versionText = $('<div class="lEditor-button-group">&nbsp;&nbsp;lEditor v'+version+'&nbsp;&nbsp;</div>');
                    versionText.css({
                        'color': '#999',
                        'font-size': '14px'
                    });
                    lbuttonGithub = builders.button('github');
                    lbuttonMail = builders.button('envelope');
                    ltabpageAbout.append(versionText);
                    ltabpageAbout.append(builders.buttonGroup([lbuttonGithub, lbuttonMail]));
                    ltabpageAbout.hide();
                    ltabContainer.append(ltabAbout);
                }
                ltoobar.append(ltabContainer);
            } else {
                ltabpageInsert = ltabpageStart = $('<div class="lEditor-tab-page"></div>')
            }
            
            /* - toolbar buttons */
            for (var item in opToolBar) {
                if (opToolBar[item] == 'undo') {
                    //---undo-redo
                    btnExist.undo = true;
                    lbuttonUndo = builders.button('undo');
                    lbuttonRepeat = builders.button('repeat');
                    ltabpageStart.append(builders.buttonGroup([lbuttonUndo, lbuttonRepeat]));
                } else if (opToolBar[item] == 'heading') {
                    //---font
                    btnExist.heading = true;
                    lheadingPicker = builders.dropDownMenu('H1', '20px');
                    ltabpageStart.append(builders.buttonGroup([lheadingPicker]));
                } else if (opToolBar[item] == 'font') {
                    //---font
                    btnExist.font = true;
                    lfontPicker = builders.dropDownMenu(opFont, '80px');
                    lfontSizePicker = builders.dropDownMenu(opFontSize, '12px');
                    ltabpageStart.append(builders.buttonGroup([lfontPicker, lfontSizePicker]));
                } else if (opToolBar[item] == 'style') {
                    //---style
                    btnExist.style = true;
                    lbuttonBold = builders.button('bold');
                    lbuttonItalic = builders.button('italic');
                    lbuttonUnderline = builders.button('underline');
                    lbuttonStrike = builders.button('strikethrough');
                    ltabpageStart.append(builders.buttonGroup([lbuttonBold, lbuttonItalic, lbuttonUnderline, lbuttonStrike]));
                } else if (opToolBar[item] == 'color') {
                    //---color
                    btnExist.color = true;
                    lbuttonColor = builders.colorPicker('pencil', 'color', opColor);
                    lbuttonBgColor = builders.colorPicker('paint-brush', 'background-color', opBgColor);
                    ltabpageStart.append(builders.buttonGroup([lbuttonColor, lbuttonBgColor]));
                } else if (opToolBar[item] == 'align') {
                    //---align
                    btnExist.align = true;
                    lbuttonAlignLeft = builders.button('align-left');
                    lbuttonAlignCenter = builders.button('align-center');
                    lbuttonAlignRight = builders.button('align-right');
                    ltabpageStart.append(builders.buttonGroup([lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight]));
                } else if (opToolBar[item] == 'list') {
                    //---list
                    btnExist.list = true;
                    lbuttonUl = builders.button('list-ul');
                    lbuttonOl = builders.button('list-ol');
                    ltabpageInsert.append(builders.buttonGroup([lbuttonUl, lbuttonOl]));
                } else if (opToolBar[item] == 'link') {
                    //---link
                    btnExist.link = true;
                    lbuttonLink = builders.button('link');
                    lbuttonDelLink = builders.button('chain-broken');
                    ltabpageInsert.append(builders.buttonGroup([lbuttonLink, lbuttonDelLink]));
                } else if (opToolBar[item] == 'media') {
                    //---insert
                    btnExist.media = true;
                    lbuttonImage = builders.button('image');
                    ltabpageInsert.append(builders.buttonGroup([lbuttonImage]));
                } else if (opToolBar[item] == 'textblock') {
                    //---insert
                    btnExist.textblock = true;
                    lbuttonHr = builders.button('minus');
                    lbuttonQuote = builders.button('quote-left');
                    lbuttonCode = builders.button('code');
                    ltabpageInsert.append(builders.buttonGroup([lbuttonHr, lbuttonQuote, lbuttonCode]));
                } else if (opToolBar[item] == 'remove') {
                    btnExist.remove = true;
                    lbuttonRemoveFormat = builders.button('eraser');
                    lbuttonCLear = builders.button('trash');
                    ltabpageStart.append(builders.buttonGroup([lbuttonRemoveFormat, lbuttonCLear]));
                }
            }
            
            if (opTab == 'on') {
                ltoobar.append(ltabpageStart).append(ltabpageInsert);
                if (opAbout == 'on')
                    ltoobar.append(ltabpageAbout);
            } else {
                ltoobar.append(ltabpageStart);
            }
            
            lcontainer.append(ltoobar);
            
            /* build iframe */
            var lframeContainer,
                lframe,
                frameWindow, lframeWindow,
                frameDocument, lframeDocument;
            lframeContainer = $('<div class="lEditor-frame-container" width="100%" style="height:'+
                                (lcontainer.innerHeight() - ltoobar.outerHeight())+
                                'px"></div>');
            lcontainer.append(lframeContainer);
            lframe = $('<iframe class="lEditor-frame" frameborder="0" width="100%" height="100%"></iframe>');
            lframeContainer.append(lframe);
            frameWindow = lframe[0].contentWindow;
            lframeWindow = $(frameWindow);
            frameDocument = frameWindow.document;
            lframeDocument = $(frameDocument);
            frameDocument.open();
            frameDocument.write('<!DOCTYPE html>'+
                                '<html lang="en">'+
                                '<head>'+
                                '   <meta charset="UTF-8">'+
                                '   <title>lEditor</title>'+
                                '   <style>'+
                                '   body{'+
                                '       font-family:'+fonts[opFont]+';'+
                                '       word-wrap: break-word;'+
                                '   }'+
                                '   pre{'+
                                '       font-family: "consolas", "courier new", monospace;'+
                                '       background-color: #eee;'+
                                '       padding: 10px;'+
                                '       border-radius: 4px;'+
                                '   }'+
                                '   blockquote{'+
                                '       padding: 5px 10px;'+
                                '       border-left: 2px solid #84def4;'+
                                '   }</style>'+
                                '</head>'+
                                '<body>'+
                                opText+
                                '<br></body>'+
                                '</html>');
            frameDocument.close();
            frameDocument.designMode = "on";
            window.onload = function () {
                if (frameDocument.designMode.toLowerCase() === 'off') {
                    frameDocument.designMode = 'on';
                }
                frameDocument.execCommand('fontSize', false, opFontSize);
                frameDocument.execCommand('fontName', false, fonts[opFont]);
            };
            
            /* set appearance */
            if (opButtonSize) {
                lcontainer.find('.lEditor-button, .lEditor-font-text').css('font-size', opButtonSize);
            }
            if (opFrameBgColor) {
                lcontainer.find('.lEditor-frame').css('background-color', opFrameBgColor);
            }
            if (opColor) {
                lframeDocument.find('body').css('color', opColor);
            }
            if (opToolBarBgColor) {
                lcontainer.find('.lEditor-toolbar').css('background-color', opToolBarBgColor);
            }
            if (opToolBarColor) {
                lcontainer.find('.lEditor-toolbar').css('color', opToolBarColor);
            }
            // buttons align center in full screen mode
            if (opExitFullScreen) {
                ltoobar.css('text-align', 'center');
                lframeDocument.find('body').css('margin', '20px 20%');
            }
            
            /* set listeners */
            var selectedText, 
                // the innerhtml code
                HTMLCode = opText,
                hintDiv = null,
                activeTab = ltabStart,
                activeTabPage = ltabpageStart;
            
            /* - function collection */
            var funcs = {
                keyDown: function (e) {
                    /* for enter key, insert a br instead a div */
                    if (e.keyCode == 13) {
                        var sel, range;
                        sel = frameWindow.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            range = sel.getRangeAt(0);
                            // the current node name 
                            var snodeName = range.startContainer.parentNode.nodeName.toLowerCase();
                            // only insert <br> when in body or blocks
                            var names = ['li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
                            if (names.indexOf(snodeName) == -1) {
                                range.deleteContents();
                                var br = frameDocument.createElement("br");
                                range.insertNode(br);
                                range.setStartAfter(br);
                                range.setEndAfter(br);
                                sel.removeAllRanges();
                                sel.addRange(range);
                                e.preventDefault();
                            }
                        }
                    }
                    /* for del key, delete the pre/quote/heading */
                    if (e.keyCode == 8 || e.keyCode == 46) {
                        var sel, range;
                        sel = frameWindow.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            range = sel.getRangeAt(0);
                            var snode = range.startContainer;
                            var snodeName = range.startContainer.nodeName.toLowerCase();
                            // the current node name is pre, and it's empty
                            var names = ['pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
                            if (range.collapsed && 
                                names.indexOf(snodeName) >= 0 && 
                                snode.innerHTML == '<br>') {
                                snode.parentNode.removeChild(snode);
                                e.preventDefault();
                            }
                        }
                    }
                },
                addBr: function () {
                    lframeDocument.find('body, pre, blockquote').each(function () {
                        if (!this.lastChild || this.lastChild.nodeName.toLowerCase() != "br") {
                            this.appendChild(document.createElement("br"));
                        }
                    })
                },
                moved: function (e) {
                    funcs.saveText();
                    
                    // watch A key because ctrl+A is select all
                    keyCodes = [8, 13, 46, 33, 34, 35, 36, 37, 38, 39, 40, 65];
                    if (e.type !== 'click' && 
                        !((e.type === 'keyup') && (keyCodes.indexOf(e.keyCode) != -1)))
                        return;
                    
                    if (btnExist.style) {
                        if (frameDocument.queryCommandState('bold'))
                            lbuttonBold.addClass('lEditor-button-hilighted');
                        else
                            lbuttonBold.removeClass('lEditor-button-hilighted');
                        //
                        if (frameDocument.queryCommandState('italic'))
                            lbuttonItalic.addClass('lEditor-button-hilighted');
                        else
                            lbuttonItalic.removeClass('lEditor-button-hilighted');
                        //
                        if (frameDocument.queryCommandState('underline'))
                            lbuttonUnderline.addClass('lEditor-button-hilighted');
                        else
                            lbuttonUnderline.removeClass('lEditor-button-hilighted');
                    }
                    if (btnExist.align) {
                        if (frameDocument.queryCommandState('JustifyLeft'))
                            lbuttonAlignLeft.addClass('lEditor-button-hilighted');
                        else
                            lbuttonAlignLeft.removeClass('lEditor-button-hilighted');
                        //
                        if (frameDocument.queryCommandState('JustifyCenter'))
                            lbuttonAlignCenter.addClass('lEditor-button-hilighted');
                        else
                            lbuttonAlignCenter.removeClass('lEditor-button-hilighted');
                        //
                        if (frameDocument.queryCommandState('JustifyRight'))
                            lbuttonAlignRight.addClass('lEditor-button-hilighted');
                        else
                            lbuttonAlignRight.removeClass('lEditor-button-hilighted');
                    }
                    
                    if (frameDocument.getSelection().rangeCount) {
                        selectedText = frameDocument.getSelection().getRangeAt(0);
                        // in IE, sometimes the whole html will be selected
                        if (selectedText.startContainer.nodeName.toLowerCase() == 'html'
                            && selectedText.endContainer.nodeName.toLowerCase() == 'html') {
                            var sel = frameDocument.getSelection();
                            sel.removeAllRanges();
                            // so only select the body
                            var bodyRange = frameDocument.createRange();
                            bodyRange.setStart(frameDocument.body, 0);
                            bodyRange.setEnd(frameDocument.body, frameDocument.body.children.length);
                            sel.addRange(bodyRange);
                            selectedText = frameDocument.getSelection().getRangeAt(0);
                        }
                    }
                    
                    $('.lEditor-font-div, .lEditor-color-div, .lEditor-link-div').slideUp(200, function () {
                        $(this).remove();
                    });

                },
                saveText: function () {
                    HTMLCode = frameDocument.body.innerHTML;
                    if (opCallback) {
                        opCallback.call(this, HTMLCode);
                    }
                },
                undo: function () {
                    frameDocument.execCommand('undo');
                },
                redo: function () {
                    frameDocument.execCommand('redo');
                },
                bold: function () {
                    frameDocument.execCommand('bold');
                    if (frameDocument.queryCommandState('bold'))
                        lbuttonBold.addClass('lEditor-button-hilighted');
                    else
                        lbuttonBold.removeClass('lEditor-button-hilighted');
                },
                italic: function () {
                    frameDocument.execCommand('italic');
                    if (frameDocument.queryCommandState('italic'))
                        lbuttonItalic.addClass('lEditor-button-hilighted');
                    else
                        lbuttonItalic.removeClass('lEditor-button-hilighted');
                },
                underline: function () {
                    frameDocument.execCommand('underline');
                    if (frameDocument.queryCommandState('underline'))
                        lbuttonUnderline.addClass('lEditor-button-hilighted');
                    else
                        lbuttonUnderline.removeClass('lEditor-button-hilighted');
                },
                strike: function () {
                    frameDocument.execCommand('strikeThrough');
                    if (frameDocument.queryCommandState('strikeThrough'))
                        lbuttonStrike.addClass('lEditor-button-hilighted');
                    else
                        lbuttonStrike.removeClass('lEditor-button-hilighted');
                },
                alignLeft: function () {
                    frameDocument.execCommand('JustifyLeft');
                    if (frameDocument.queryCommandState('JustifyLeft'))
                        lbuttonAlignLeft.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignLeft.removeClass('lEditor-button-hilighted');
                },
                alignCenter: function () {
                    frameDocument.execCommand('JustifyCenter');
                    if (frameDocument.queryCommandState('JustifyCenter'))
                        lbuttonAlignCenter.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignCenter.removeClass('lEditor-button-hilighted');
                },
                alignRight: function () {
                    frameDocument.execCommand('JustifyRight');
                    if (frameDocument.queryCommandState('JustifyRight'))
                        lbuttonAlignRight.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignRight.removeClass('lEditor-button-hilighted');
                },
                heading: function () {
                    var fontPickerDiv = $('<div class="lEditor-font-div"></div>'),
                        fontPickerList = $('<ul class="lEditor-font-list"></ul>');
                    for (var f in headings) {
                        var fontItem = $('<li>'+f+'</li>');
                        // set click listener to each list item
                        fontItem.click(function () {
                            var headText = $(this).text()
                            // for IE
                            var sel = frameDocument.getSelection();
                            if (!sel || sel.anchorOffset === 0) {
                                sel.removeAllRanges();
                                sel.addRange(selectedText);
                            }
                            console.log(headText);
                            frameDocument.execCommand('formatBlock', false, '<'+headText+'>');
                            lheadingPicker.find('.lEditor-font-text').text(headText);
                            fontPickerDiv.slideUp(200, function () {
                                $(this).remove();
                            });
                        });
                        fontPickerList.append(fontItem);
                    }
                    fontPickerDiv.append(fontPickerList).hide();
                    $('body').append(fontPickerDiv);
                    fontPickerDiv.slideDown(200);
                    var pos = lheadingPicker.offset();
                    fontPickerDiv.offset(pos);
                },
                changeFontFace: function () {
                    var fontPickerDiv = $('<div class="lEditor-font-div"></div>'),
                        fontPickerList = $('<ul class="lEditor-font-list"></ul>');
                    for (var f in fonts) {
                        var fontItem = $('<li style="font-family:' + fonts[f] + '">' + f + '</li>');
                        // set click listener to each list item
                        fontItem.click(function () {
                            var fontCss = $(this).css('font-family');
                            var fontName = $(this).text();
                            // for IE
                            var sel = frameDocument.getSelection();
                            if (!sel || sel.anchorOffset === 0) {
                                sel.removeAllRanges();
                                sel.addRange(selectedText);
                            }
                            frameDocument.execCommand('fontName', false, fontCss);
                            lfontPicker.find('.lEditor-font-text').text(fontName);
                            fontPickerDiv.slideUp(200, function () {
                                $(this).remove();
                            });
                        });
                        fontPickerList.append(fontItem);
                    }
                    fontPickerDiv.append(fontPickerList).hide();
                    $('body').append(fontPickerDiv);
                    fontPickerDiv.slideDown(200);
                    var pos = lfontPicker.offset();
                    fontPickerDiv.offset(pos);
                },
                changeFontSize: function () {
                    var fontSizePickerDiv = $('<div class="lEditor-font-div"></div>'),
                        fontSizePickerList = $('<ul class="lEditor-font-list"></ul>');
                    for (var f in fontSizes) {
                        var fontItem = $('<li style="font-size:' + fontSizes[f] + '">' + f + '</li>');
                        // set click listener to each list item
                        fontItem.click(function () {
                            var sizeName = $(this).text();
                            // for IE
                            var sel = frameDocument.getSelection();
                            if (!sel || sel.anchorOffset === 0) {
                                sel.removeAllRanges();
                                sel.addRange(selectedText);
                            }
                            frameDocument.execCommand('fontSize', false, sizeName);
                            lfontSizePicker.find('.lEditor-font-text').text(sizeName);
                            fontSizePickerDiv.slideUp(200, function () {
                                $(this).remove();
                            });
                        });
                        fontSizePickerList.append(fontItem);
                    }
                    fontSizePickerDiv.append(fontSizePickerList).hide();
                    $('body').append(fontSizePickerDiv);
                    fontSizePickerDiv.slideDown(200);
                    var pos = lfontSizePicker.offset();
                    fontSizePickerDiv.offset(pos);
                },
                changeColor: function (e) {
                    var colorPickerDiv = $('<div class="lEditor-color-div"></div>');
                    for (var c in colors) {
                        var colorBox = $('<div class="lEditor-color-box" style="background-color:' + colors[c] + '"></div');
                        colorBox.click(function () {
                            var color = $(this).css('background-color');
                            // for IE
                            var sel = frameDocument.getSelection();
                            if (!sel || sel.anchorOffset === 0) {
                                sel.removeAllRanges();
                                sel.addRange(selectedText);
                            }
                            frameDocument.execCommand(e.data.type, false, color);
                            lbuttonColor.css('color', color);
                            colorPickerDiv.slideUp(200, function () {
                                $(this).remove();
                            });
                        });
                        colorPickerDiv.append(colorBox);
                    }
                    colorPickerDiv.hide();
                    $('body').append(colorPickerDiv);
                    colorPickerDiv.slideDown(200);
                    var pos = lbuttonColor.offset();
                    colorPickerDiv.offset(pos);
                },
                orderList: function () {
                    frameDocument.execCommand('insertOrderedList');
                },
                unorderList: function () {
                    frameDocument.execCommand('insertUnorderedList');   
                },
                hr: function () {
                    frameDocument.execCommand('insertHorizontalRule'); 
                },
                insertLink: function () {
                    var linkDiv = $('<div class="lEditor-link-div"></div>'),
                        linkUrl = $('<input type="text" class="lEditor-input-text"></div>'),
                        linkOKButton = $('<div class="lEditor-okbutton">OK</div>');
                    linkOKButton.click(function () {
                        var url = linkUrl.val(),
                            sel = frameDocument.getSelection();
                        // for IE
                        if (!sel || sel.anchorOffset === 0) {
                            sel.removeAllRanges();
                            sel.addRange(selectedText);
                        }
                        if (url) {
                            if (!(url.startsWith('http://') || url.startsWith('https://')))
                                url = 'http://' + url;
                            frameDocument.execCommand('createLink', false, url);
                        }
                        linkDiv.slideUp(200, function () {
                            $(this).remove();
                        });
                    });
                    linkDiv.append($('<h4>Link URL:</h4>')).append(linkUrl).append(linkOKButton).hide();
                    $('body').append(linkDiv);
                    linkDiv.slideDown(200);
                    var pos = lbuttonLink.offset();
                    linkDiv.offset(pos);
                },
                delLink: function () {
                    frameDocument.execCommand('unLink');
                },
                image: function () {
                    var linkDiv = $('<div class="lEditor-link-div"></div>'),
                        linkUrl = $('<input type="text" class="lEditor-input-text"></div>'),
                        linkOKButton = $('<div class="lEditor-okbutton">OK</div>');
                    linkOKButton.click(function () {
                        var url = linkUrl.val(),
                            sel = frameDocument.getSelection();
                        // for opera and IE
                        if (!sel || sel.anchorOffset === 0) {
                            sel.removeAllRanges();
                            sel.addRange(selectedText);
                        }
                        if (url) {
                            if (!(url.startsWith('http://') || url.startsWith('https://')))
                                url = 'http://' + url;
                            frameDocument.focus();
                            frameDocument.execCommand('insertImage', false, url);
                        }
                        linkDiv.slideUp(200, function () {
                            $(this).remove();
                        });
                    });
                    linkDiv.append($('<h4>Image URL:</h4>')).append(linkUrl).append(linkOKButton).hide();
                    $('body').append(linkDiv);
                    linkDiv.slideDown(200);
                    var pos = lbuttonImage.offset();
                    linkDiv.offset(pos);
                },
                insertBlock: function (e) {
                    var sel = frameDocument.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        var snodeName = range.startContainer.nodeName.toLowerCase();
                        var sparentNodeName = range.startContainer.parentNode.nodeName.toLowerCase();
                        // if in pre
                        if (snodeName == e.data.type || sparentNodeName == e.data.type) {
                            return;
                        }
                    }
                    sel += '<br>';
                    var codeHtml = '<'+e.data.type+'>' + sel + '</'+e.data.type+'>';
                    utils.insertHTML(frameWindow, frameDocument, codeHtml);
                },
                removeFormat: function () {
                    frameDocument.execCommand('removeFormat');
                },
                clear: function () {
                    frameDocument.body.innerHTML = '';
                },
                fullScreen: function () {
                    $('body').addClass('fullscreen-mode');
                    var size = {
                        height: $(window).height(),
                        width: $(window).width()
                    };
                    var fullScreenDiv = $('<div class="lEditor-full-div"></div>');
                    fullScreenDiv.css({
                        'position': 'fixed',
                        'top': '0',
                        'left': '0',
                        'width': size.width +'px',
                        'height': size.height +'px'
                    }).hide();
                    $('body').append(fullScreenDiv);
                    fullScreenDiv.lEditor({
                        full_screen: true,
                        exit_full_screen: true,
                        height: size.height + 'px',
                        textarea_bg_color: '#f0efd6',
                        toolbar_bg_color: '#dedece',
                        toolbar: opToolBar,
                        about: 'on',
                        text: HTMLCode,
                        father_document: frameDocument
                    });
                    fullScreenDiv.fadeIn(300);
                },
                exitFullScreen: function () {
                    opFatherDocument.body.innerHTML = HTMLCode;
                    $('body').removeClass('fullscreen-mode');
                    $('body').find('.lEditor-hint-div').remove();
                    $('.lEditor-full-div').fadeOut(300, function () {
                        $(this).remove();
                    });
                },
                hint: function (e) {
                    if (hintDiv == null) {
                        var pos = $(this).offset();
                        hintDiv = $('<div class="lEditor-hint-div">'+e.data.hint+'</div>');
                        $('body').append(hintDiv);
                        // move up / down
                        if (this.getBoundingClientRect().top >=20)
                            pos.top -= 20;
                        else pos.top += $(this).outerHeight()+5;
                        // make it at middle
                        pos.left -= (hintDiv.outerWidth() - $(this).outerWidth())/2;
                        hintDiv.css({
                            top: pos.top,
                            left: pos.left
                        }).hide();
                        hintDiv.show();
                    }
                },
                hideHint: function () {
                    var tempHintDiv = hintDiv;
                    hintDiv = null;
                    tempHintDiv.fadeOut(200, function () {
                        $(this).remove();
                    });
                    hintDiv = null;
                },
                switchTab: function (e) {
                    var target = e.data.target;
                    if (target == activeTabPage)
                        return;
                    activeTab.removeClass('lEditor-tab-active');
                    activeTabPage.hide();
                    $(this).addClass('lEditor-tab-active');
                    target.show();
                    activeTab = $(this);
                    activeTabPage = target;
                },
                openLink: function (e) {
                    window.open(e.data.link, '_blank');
                }
            };
            
            /* - text area */
            lframeWindow.click(funcs.moved)
                .keydown(funcs.keyDown)
                .keyup(funcs.moved)
                .blur(funcs.saveText);
            lframeDocument.find('body').keyup(funcs.addBr);
            
            /* - tabs */
            if (opTab == 'on') {
                ltabStart.click({target: ltabpageStart}, funcs.switchTab);
                ltabInsert.click({target: ltabpageInsert}, funcs.switchTab);
                if (opAbout == 'on') {
                    ltabAbout.click({target: ltabpageAbout}, funcs.switchTab);
                }
            }
        
            /* - buttons */
            ltoobar.click(funcs.saveText);
            
            if (btnExist.undo) {
                lbuttonUndo.click(funcs.undo).mouseover({hint:'undo'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonRepeat.click(funcs.redo).mouseover({hint:'redo'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.heading) {
                lheadingPicker.click(funcs.heading).mouseover({hint:'heading'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.style) {
                lbuttonBold.click(funcs.bold).mouseover({hint:'bold'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonItalic.click(funcs.italic).mouseover({hint:'italic'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonUnderline.click(funcs.underline).mouseover({hint:'underline'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonStrike.click(funcs.strike).mouseover({hint:'strike through'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.align) {
                lbuttonAlignLeft.click(funcs.alignLeft).mouseover({hint:'align left'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonAlignCenter.click(funcs.alignCenter).mouseover({hint:'align center'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonAlignRight.click(funcs.alignRight).mouseover({hint:'align right'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.font) {
                lfontPicker.click(funcs.changeFontFace).mouseover({hint:'font'}, funcs.hint).mouseleave(funcs.hideHint);;
                lfontSizePicker.click(funcs.changeFontSize).mouseover({hint:'font size'}, funcs.hint).mouseleave(funcs.hideHint);;
            }
            if (btnExist.color) {
                lbuttonColor.click({type:'foreColor'}, funcs.changeColor)
                    .mouseover({hint:'foreground color'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonBgColor.click({type:'backColor'}, funcs.changeColor)
                    .mouseover({hint:'background color'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.list) {
                lbuttonOl.click(funcs.orderList).mouseover({hint:'order list'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonUl.click(funcs.unorderList).mouseover({hint:'unorder list'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.link) {
                lbuttonLink.click(funcs.insertLink).mouseover({hint:'add link'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonDelLink.click(funcs.delLink).mouseover({hint:'remove link'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.media) {
                lbuttonImage.click(funcs.image).mouseover({hint:'image'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.textblock) {
                lbuttonHr.click(funcs.hr).mouseover({hint:'horizontal rule'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonQuote.click({type:'blockquote'}, funcs.insertBlock)
                    .mouseover({hint:'quote'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonCode.click({type:'pre'}, funcs.insertBlock)
                    .mouseover({hint:'code'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (btnExist.remove) {
                lbuttonRemoveFormat.click(funcs.removeFormat).mouseover({hint:'remove format'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonCLear.click(funcs.clear).mouseover({hint:'clear all'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (opExitFullScreen) {
                lbuttonFullScreen.click(funcs.exitFullScreen).mouseover({hint:'exit'}, funcs.hint).mouseleave(funcs.hideHint);
            } else if (opFullScreen) {
                lbuttonFullScreen.click(funcs.fullScreen).mouseover({hint:'full screen'}, funcs.hint).mouseleave(funcs.hideHint);
            }
            if (opAbout == 'on' && opTab == 'on') {
                lbuttonGithub.click({link:'//github.com/lhc70000/lEditor'}, funcs.openLink)
                    .mouseover({hint:'view on github'}, funcs.hint).mouseleave(funcs.hideHint);
                lbuttonMail.click({link:'mailto:lhc199652@gmail.com'}, funcs.openLink)
                    .mouseover({hint:'send email'}, funcs.hint).mouseleave(funcs.hideHint);
            }
        }
    });
})(window, document);