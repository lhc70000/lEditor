/**
 * lEditor
 * v 0.4.1
 * by lhc (lhc199652@gmail.com)
 */

(function(window, document, undefined){
    
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
    
    /* other initialization */
    // add startsWith method to String
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }
    
    /* builders for buttons and button groups */
    var builders = {
        // builder for button groups
        buttonGroup: function(buttonArray){
            var lbuttonGroup = $('<div class="lEditor-button-group"></div>');
            for (var btn in buttonArray){
                lbuttonGroup.append(buttonArray[btn]);
            }
            return lbuttonGroup;
        },
        // builder for buttons
        button: function(icon){
            var lbutton = $('<div class="lEditor-button"></div>'),
                licon = $('<i class="fa fa-' + icon + '"></i>');
            lbutton.append(licon);
            return lbutton;
        },
        // builder for font picker
        fontPicker: function(initFont){
            var fontPickerContainer = $('<div class="lEditor-font-container"></div>'),
                fontPickerText = $('<div class="lEditor-font-text" style="width: 60px;font-family:' + fonts[initFont] + '">'+initFont+'</div>'),
                fontPickerButton = $('<div class="lEditor-button"></div>'),
                fontPickerIcon = $('<i class="fa fa-angle-down"></i>');
            fontPickerButton.append(fontPickerIcon);
            fontPickerContainer.append(fontPickerText).append(fontPickerButton);
            return fontPickerContainer;
        },
        // builder for font size picker
        fontSizePicker: function(initFontSize){
            var fontSizePickerContainer = $('<div class="lEditor-font-container"></div>'),
                fontSizePickerText = $('<div class="lEditor-font-text" style="width: 12px;">' + initFontSize + '</div>'),
                fontSizePickerButton = $('<div class="lEditor-button"></div>'),
                fontSizePickerIcon = $('<i class="fa fa-angle-down"></i>');
            fontSizePickerButton.append(fontSizePickerIcon);
            fontSizePickerContainer.append(fontSizePickerText).append(fontSizePickerButton);
            return fontSizePickerContainer;
        },
        // builder for color picker
        colorPicker: function(icon, type, color){
            var lbutton = $('<div class="lEditor-button"></div>'),
                licon = $('<i class="fa fa-' + icon + '"></i>');
            lbutton.css(type, color);
            lbutton.append(licon);
            return lbutton;
        }
    };
    
    /* other functions */
    var utils = {
        insertHTML: function(window, document, html){
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
        lEditor: function(options){
            /* options handling*/
            options = options || [];
            var initHeight = options.height || '200px',
                initFont = options.font || 'Arial',
                initFontSize = options.font_size || 4,
                initColor = options.color || '#000',
                initBgColor = options.bg_color || '#fff',
                initToolBar = options.toolbar || ['undo', 'font', 'style', 'color', 'align', 'list', 'link', 'insert', 'remove'],
                initFullScreen = options.full_screen || false,
                initExitFullScreen = options.exit_full_screen || false, // private
                initFatherDocument = options.father_document || undefined, // private
                initText = options.text || '',
                initCallback = options.callback || undefined,
                initButtonSize = options.button_size || undefined,
                initFrameBgColor = options.textarea_bg_color || undefined,
                initToolBarBgColor = options.toolbar_bg_color || undefined;
            
            /* build container */
            var lcontainer;
            lcontainer = $('<div class="lEditor-container" width="100%" style="height:' + initHeight + '"></div>');
            this.append(lcontainer);
            
            /* build toolbar */
            var ltoobar,
                lbuttonFullScreen,
                lbuttonUndo, lbuttonRepeat,
                lfontPicker, lfontSizePicker,
                lbuttonBold, lbuttonItalic, lbuttonUnderline,
                lbuttonColor, lbuttonBgColor,
                lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight,
                lbuttonOl, lbuttonUl,
                lbuttonLink, lbuttonDelLink,
                lbuttonImage, lbuttonCode,
                lbuttonRemoveFormat, lbuttonCLear,
                // whether button group exist
                btnExist = {
                    'undo': false,
                    'font': false,
                    'style': false,
                    'color': false,
                    'align': false,
                    'list': false,
                    'link':false,
                    'insert': false,
                    'remove': false
                };
            ltoobar = $('<div class="lEditor-toolbar" width="100%"></div>');
            
            /* - */
            if (initFullScreen){
                lbuttonFullScreen = builders.button('expand');
                lbuttonFullScreen.css('float', 'right');
                ltoobar.append(lbuttonFullScreen);
            }
            for (var item in initToolBar) {
                if (initToolBar[item] == 'undo'){
                    //---undo-redo
                    btnExist.undo = true;
                    lbuttonUndo = builders.button('undo');
                    lbuttonRepeat = builders.button('repeat');
                    ltoobar.append(builders.buttonGroup([lbuttonUndo, lbuttonRepeat]));
                } else if (initToolBar[item] == 'font'){
                    //---font
                    btnExist.font = true;
                    lfontPicker = builders.fontPicker(initFont);
                    lfontSizePicker = builders.fontSizePicker(initFontSize);
                    ltoobar.append(builders.buttonGroup([lfontPicker, lfontSizePicker]));
                } else if (initToolBar[item] == 'style'){
                    //---style
                    btnExist.style = true;
                    lbuttonBold = builders.button('bold');
                    lbuttonItalic = builders.button('italic');
                    lbuttonUnderline = builders.button('underline');
                    ltoobar.append(builders.buttonGroup([lbuttonBold, lbuttonItalic, lbuttonUnderline]));
                } else if (initToolBar[item] == 'color'){
                    //---color
                    btnExist.color = true;
                    lbuttonColor = builders.colorPicker('font', 'color', initColor);
                    lbuttonBgColor = builders.colorPicker('font', 'background-color', initBgColor);
                    ltoobar.append(builders.buttonGroup([lbuttonColor, lbuttonBgColor]));
                } else if (initToolBar[item] == 'align'){
                    //---align
                    btnExist.align = true;
                    lbuttonAlignLeft = builders.button('align-left');
                    lbuttonAlignCenter = builders.button('align-center');
                    lbuttonAlignRight = builders.button('align-right');
                    ltoobar.append(builders.buttonGroup([lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight]));
                } else if (initToolBar[item] == 'list'){
                    //---list
                    btnExist.list = true;
                    lbuttonUl = builders.button('list-ul');
                    lbuttonOl = builders.button('list-ol');
                    ltoobar.append(builders.buttonGroup([lbuttonUl, lbuttonOl]));
                } else if (initToolBar[item] == 'link'){
                    //---link
                    btnExist.link = true;
                    lbuttonLink = builders.button('link');
                    lbuttonDelLink = builders.button('chain-broken');
                    ltoobar.append(builders.buttonGroup([lbuttonLink, lbuttonDelLink]));
                } else if (initToolBar[item] == 'insert'){
                    //---insert
                    btnExist.insert = true;
                    lbuttonImage = builders.button('image');
                    lbuttonCode = builders.button('code');
                    ltoobar.append(builders.buttonGroup([lbuttonImage, lbuttonCode]));
                } else if (initToolBar[item] == 'remove'){
                    btnExist.remove = true;
                    lbuttonRemoveFormat = builders.button('eraser');
                    lbuttonCLear = builders.button('trash');
                    ltoobar.append(builders.buttonGroup([lbuttonRemoveFormat, lbuttonCLear]));
                }
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
                                '    <meta charset="UTF-8">'+
                                '    <title>lEditor</title>'+
                                '    <style>'+
                                '    body{font-family:'+fonts[initFont]+'}'+
                                '    pre{'+
                                '    background-color: #eee;'+
                                '    padding: 10px;'+
                                '    border-radius: 4px;'+
                                '    }</style>'+
                                '</head>'+
                                '<body>'+
                                initText+
                                '</body>'+
                                '</html>');
            frameDocument.close();
            frameDocument.designMode = "on";
            frameDocument.execCommand('fontSize', false, initFontSize);
            frameDocument.execCommand('fontName', false, fonts[initFont]);
            window.onload = function () {
                if (frameDocument.designMode.toLowerCase() === 'off') {
                    frameDocument.designMode = 'on';
                }
            };
            
            /* set appearance */
            if (initButtonSize){
                lcontainer.find('.lEditor-button, .lEditor-font-text').css('font-size', initButtonSize);
            }
            if (initFrameBgColor){
                lcontainer.find('.lEditor-frame').css('background-color', initFrameBgColor);
            }
            if (initToolBarBgColor){
                lcontainer.find('.lEditor-toolbar').css('background-color', initToolBarBgColor);
            }
            
            /* set listeners */
            var selectedText, 
                // the innerhtml code
                HTMLCode = initText;
            
            /* - function collection */
            var funcs = {
                keyPress: function(e){
                    /* for enter key, insert a br instead a div */
                    if (e.keyCode == 13){
                        var sel, range;
                        if (frameWindow.getSelection) {
                            sel = frameWindow.getSelection();
                            if (sel.getRangeAt && sel.rangeCount){
                                range = sel.getRangeAt(0);
                                range.deleteContents();
                                var br = document.createElement("br");
                                range.insertNode(br);
                                range.setStartAfter(br);
                                range.setEndAfter(br);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                        }
                        e.preventDefault();
                    }
                    /* for del key, delete the pre */
                    if (e.keyCode == 8 || e.keyCode == 46){
                        var sel, range;
                        if (frameWindow.getSelection) {
                            sel = frameWindow.getSelection();
                            console.log(sel);
                        }
                    }
                },
                addBr: function() {
                    lframeDocument.find('body, pre').each(function(){
                        if (this.lastChild.nodeName.toLowerCase() != "br") {
                            this.appendChild(document.createElement("br"));
                        }
                    })
                },
                moved: function(e){
                    funcs.saveText();
                    
                    keyCodes = [8, 13, 46, 33, 34, 35, 36, 37, 38, 39, 40];
                    if (e.type !== 'click' && 
                        !((e.type === 'keyup') && (keyCodes.indexOf(e.keyCode) != -1)))
                        return;
                    
                    if (btnExist.style){
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
                    if (btnExist.align){
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
                    
                    selectedText = frameDocument.getSelection().getRangeAt(0);
                    
                    $('.lEditor-font-div, .lEditor-color-div, .lEditor-link-div').slideUp(200, function(){
                        $(this).remove();
                    });

                },
                saveText: function(){
                    HTMLCode = frameDocument.body.innerHTML;
                    if (initCallback){
                        console.log('callback');
                        initCallback.call(this, HTMLCode);
                    }
                },
                undo: function(){
                    frameDocument.execCommand('undo');
                },
                redo: function(){
                    frameDocument.execCommand('redo');
                },
                bold: function(){
                    frameDocument.execCommand('bold');
                    if (frameDocument.queryCommandState('bold'))
                        lbuttonBold.addClass('lEditor-button-hilighted');
                    else
                        lbuttonBold.removeClass('lEditor-button-hilighted');
                },
                italic: function(){
                    frameDocument.execCommand('italic');
                    if (frameDocument.queryCommandState('italic'))
                        lbuttonItalic.addClass('lEditor-button-hilighted');
                    else
                        lbuttonItalic.removeClass('lEditor-button-hilighted');
                },
                underline: function(){
                    frameDocument.execCommand('underline');
                    if (frameDocument.queryCommandState('underline'))
                        lbuttonUnderline.addClass('lEditor-button-hilighted');
                    else
                        lbuttonUnderline.removeClass('lEditor-button-hilighted');
                },
                alignLeft: function(){
                    frameDocument.execCommand('JustifyLeft');
                    if (frameDocument.queryCommandState('JustifyLeft'))
                        lbuttonAlignLeft.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignLeft.removeClass('lEditor-button-hilighted');
                },
                alignCenter: function(){
                    frameDocument.execCommand('JustifyCenter');
                    if (frameDocument.queryCommandState('JustifyCenter'))
                        lbuttonAlignCenter.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignCenter.removeClass('lEditor-button-hilighted');
                },
                alignRight: function(){
                    frameDocument.execCommand('JustifyRight');
                    if (frameDocument.queryCommandState('JustifyRight'))
                        lbuttonAlignRight.addClass('lEditor-button-hilighted');
                    else
                        lbuttonAlignRight.removeClass('lEditor-button-hilighted');
                },
                changeFontFace: function(){
                    var fontPickerDiv = $('<div class="lEditor-font-div"></div>'),
                        fontPickerList = $('<ul class="lEditor-font-list"></ul>');
                    for (var f in fonts) {
                        var fontItem = $('<li style="font-family:' + fonts[f] + '">' + f + '</li>');
                        // set click listener to each list item
                        fontItem.click(function(){
                            var fontCss = $(this).css('font-family');
                            var fontName = $(this).text();
                            frameDocument.execCommand('fontName', false, fontCss);
                            lfontPicker.find('.lEditor-font-text').css('font-family', fontCss).text(fontName);
                            fontPickerDiv.slideUp(200, function(){
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
                changeFontSize: function(){
                    var fontSizePickerDiv = $('<div class="lEditor-font-div"></div>'),
                        fontSizePickerList = $('<ul class="lEditor-font-list"></ul>');
                    for (var f in fontSizes){
                        var fontItem = $('<li style="font-size:' + fontSizes[f] + '">' + f + '</li>');
                        // set click listener to each list item
                        fontItem.click(function(){
                            var sizeName = $(this).text();
                            frameDocument.execCommand('fontSize', false, sizeName);
                            lfontSizePicker.find('.lEditor-font-text').text(sizeName);
                            fontSizePickerDiv.slideUp(200, function(){
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
                changeColor: function(){
                    var colorPickerDiv = $('<div class="lEditor-color-div"></div>');
                    for (var c in colors){
                        var colorBox = $('<div class="lEditor-color-box" style="background-color:' + colors[c] + '"></div');
                        colorBox.click(function(){
                            var color = $(this).css('background-color');
                            frameDocument.execCommand('foreColor', false, color);
                            lbuttonColor.css('color', color);
                            colorPickerDiv.slideUp(200, function(){
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
                changeBgColor: function(){
                    var colorPickerDiv = $('<div class="lEditor-color-div"></div>');
                    for (var c in colors){
                        var colorBox = $('<div class="lEditor-color-box" style="background-color:' + colors[c] + '"></div');
                        colorBox.click(function(){
                            var color = $(this).css('background-color');
                            frameDocument.execCommand('backColor', false, color);
                            lbuttonBgColor.css('background-color', color);
                            colorPickerDiv.slideUp(200, function(){
                                $(this).remove();
                            });
                        });
                        colorPickerDiv.append(colorBox);
                    }
                    colorPickerDiv.hide();
                    $('body').append(colorPickerDiv);
                    colorPickerDiv.slideDown(200);
                    var pos = lbuttonBgColor.offset();
                    colorPickerDiv.offset(pos);
                },
                orderList: function(){
                    frameDocument.execCommand('insertOrderedList');
                },
                unorderList: function(){
                    frameDocument.execCommand('insertUnorderedList');   
                },
                insertLink: function(){
                    var linkDiv = $('<div class="lEditor-link-div"></div>'),
                        linkUrl = $('<input type="text" class="lEditor-input-text"></div>'),
                        linkOKButton = $('<div class="lEditor-okbutton">OK</div>');
                    linkOKButton.click(function(){
                        var url = linkUrl.val(),
                            sel = frameDocument.getSelection();
                        // for opera and IE
                        if (!sel || sel.anchorOffset === 0) {
                            sel.removeAllRanges();
                            sel.addRange(selectedText);
                        }
                        if (!(url.startsWith('http://') || url.startsWith('https://')))
                            url = 'http://' + url;
                        frameDocument.execCommand('createLink', false, url);
                        linkDiv.slideUp(200, function(){
                            $(this).remove();
                        });
                    });
                    linkDiv.append($('<h4>Link URL:</h4>')).append(linkUrl).append(linkOKButton).hide();
                    $('body').append(linkDiv);
                    linkDiv.slideDown(200);
                    var pos = lbuttonLink.offset();
                    linkDiv.offset(pos);
                },
                delLink: function(){
                    frameDocument.execCommand('unLink');
                },
                image: function(){
                    var linkDiv = $('<div class="lEditor-link-div"></div>'),
                        linkUrl = $('<input type="text" class="lEditor-input-text"></div>'),
                        linkOKButton = $('<div class="lEditor-okbutton">OK</div>');
                    linkOKButton.click(function(){
                        var url = linkUrl.val(),
                            sel = frameDocument.getSelection();
                        // for opera and IE
                        if (!sel || sel.anchorOffset === 0) {
                            sel.removeAllRanges();
                            sel.addRange(selectedText);
                        }
                        if (!(url.startsWith('http://') || url.startsWith('https://')))
                            url = 'http://' + url;
                        frameDocument.execCommand('insertImage', false, url);
                        linkDiv.slideUp(200, function(){
                            $(this).remove();
                        });
                    });
                    linkDiv.append($('<h4>Image URL:</h4>')).append(linkUrl).append(linkOKButton).hide();
                    $('body').append(linkDiv);
                    linkDiv.slideDown(200);
                    var pos = lbuttonLink.offset();
                    linkDiv.offset(pos);
                },
                insertCode: function(){
                    var sel = frameDocument.getSelection();
                    // for opera and IE
                    if (!sel || sel.anchorOffset === 0) {
                        sel.removeAllRanges();
                        sel.addRange(selectedText);
                    }
                    sel += '<br>';
                    var codeHtml = '<pre>' + sel + '</pre>';
                    utils.insertHTML(frameWindow, frameDocument, codeHtml);
                },
                removeFormat: function(){
                    frameDocument.execCommand('removeFormat');
                },
                clear: function(){
                    frameDocument.body.innerHTML = '';
                },
                fullScreen: function(){
                    var size = {
                        height: $(document).height(),
                        width: $(document).width()
                    };
                    var fullScreenDiv = $('<div class="lEditor-full-div"></div>');
                    fullScreenDiv.css({
                        'position': 'fixed',
                        'top': '0',
                        'left': '0',
                        'width': size.width +'px',
                        'height': size.height +'px'
                    }).hide();
                    $('body').append(fullScreenDiv).addClass('fullscreen-mode');
                    fullScreenDiv.lEditor({
                        full_screen: true,
                        exit_full_screen: true,
                        height: size.height + 'px',
                        textarea_bg_color: '#f0efd6',
                        toolbar_bg_color: '#dedece',
                        text: HTMLCode,
                        father_document: frameDocument
                    });
                    fullScreenDiv.fadeIn(300);
                },
                exitFullScreen: function(){
                    initFatherDocument.body.innerHTML = HTMLCode;
                    $('body').removeClass('fullscreen-mode');
                    $('.lEditor-full-div').fadeOut(300, function(){
                        $(this).remove();
                    });
                }
            };
            
            /* - text area */
            lframeWindow.click(funcs.moved)
                .keypress(funcs.keyPress)
                .keyup(funcs.moved)
                .blur(funcs.saveText);
            lframeDocument.find('body').keyup(funcs.addBr);
            
            /* - buttons */
            ltoobar.click(funcs.saveText);
            
            if (btnExist.undo){
                lbuttonUndo.click(funcs.undo);
                lbuttonRepeat.click(funcs.redo);
            }
            if (btnExist.style){
                lbuttonBold.click(funcs.bold);
                lbuttonItalic.click(funcs.italic);
                lbuttonUnderline.click(funcs.underline);
            }
            if (btnExist.align){
                lbuttonAlignLeft.click(funcs.alignLeft);
                lbuttonAlignCenter.click(funcs.alignCenter);
                lbuttonAlignRight.click(funcs.alignRight);
            }
            if (btnExist.font){
                lfontPicker.find('.lEditor-button').click(funcs.changeFontFace);
                lfontSizePicker.find('.lEditor-button').click(funcs.changeFontSize);
            }
            if (btnExist.color){
                lbuttonColor.click(funcs.changeColor);
                lbuttonBgColor.click(funcs.changeBgColor);
            }
            if (btnExist.list){
                lbuttonOl.click(funcs.orderList);
                lbuttonUl.click(funcs.unorderList);
            }
            if (btnExist.link){
                lbuttonLink.click(funcs.insertLink);
                lbuttonDelLink.click(funcs.delLink);
            }
            if (btnExist.insert){
                lbuttonImage.click(funcs.image);
                lbuttonCode.click(funcs.insertCode);
            }
            if (btnExist.remove){
                lbuttonRemoveFormat.click(funcs.removeFormat);
                lbuttonCLear.click(funcs.clear);
            }
            if (initExitFullScreen){
                lbuttonFullScreen.click(funcs.exitFullScreen);
            } else if (initFullScreen){
                lbuttonFullScreen.click(funcs.fullScreen);
            }
        }
    });
})(window, document);