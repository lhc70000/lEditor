/**
 * lEditor
 * v 0.3.0
 * by lhc (lhc199652(at)gmail.com)
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
        fontPicker: function(){
            var fontPickerContainer = $('<div class="lEditor-font-container"></div>'),
                fontPickerText = $('<div class="lEditor-font-text" style="width: 60px;font-family:' + fonts[defaultFont] + '">'+defaultFont+'</div>'),
                fontPickerButton = $('<div class="lEditor-button"></div>'),
                fontPickerIcon = $('<i class="fa fa-angle-down"></i>');
            fontPickerButton.append(fontPickerIcon);
            fontPickerContainer.append(fontPickerText).append(fontPickerButton);
            return fontPickerContainer;
        },
        // builder for font size picker
        fontSizePicker: function(){
            var fontSizePickerContainer = $('<div class="lEditor-font-container"></div>'),
                fontSizePickerText = $('<div class="lEditor-font-text" style="width: 12px;">' + defaultFontSize + '</div>'),
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
            defaultHeight = options.height || '200px';
            defaultFont = options.font || 'Arial';
            defaultFontSize = options.font_size || 4;
            defaultColor = options.color || '#000';
            defaultBgColor = options.bg_color || '#fff';
            defaultToolBar = options.toolbar || ['undo', 'font', 'style', 'color', 'align', 'list', 'link', 'insert'];
            
            /* build container */
            var lcontainer;
            lcontainer = $('<div class="lEditor-container" width="100%" style="height:' + defaultHeight + '"></div>');
            this.append(lcontainer);
            
            /* build toolbar */
            var ltoobar,
                lbuttonUndo, lbuttonRepeat,
                lfontPicker, lfontSizePicker,
                lbuttonBold, lbuttonItalic, lbuttonUnderline,
                lbuttonColor, lbuttonBgColor,
                lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight,
                lbuttonOl, lbuttonUl,
                lbuttonLink, lbuttonDelLink,
                lbuttonImage, lbuttonCode,
                // whether button group exist
                btnExist = {
                    'undo': false,
                    'font': false,
                    'style': false,
                    'color': false,
                    'align': false,
                    'list': false,
                    'link':false,
                    'insert': false
                };
            ltoobar = $('<div class="lEditor-toolbar" width="100%"></div>');
            
            /* */
            for (var item in defaultToolBar) {
                if (defaultToolBar[item] == 'undo'){
                    //---undo-redo
                    btnExist.undo = true;
                    lbuttonUndo = builders.button('undo');
                    lbuttonRepeat = builders.button('repeat');
                    ltoobar.append(builders.buttonGroup([lbuttonUndo, lbuttonRepeat]));
                } else if (defaultToolBar[item] == 'font'){
                    //---font
                    btnExist.font = true;
                    lfontPicker = builders.fontPicker();
                    lfontSizePicker = builders.fontSizePicker();
                    ltoobar.append(builders.buttonGroup([lfontPicker, lfontSizePicker]));
                } else if (defaultToolBar[item] == 'style'){
                    //---style
                    btnExist.style = true;
                    lbuttonBold = builders.button('bold');
                    lbuttonItalic = builders.button('italic');
                    lbuttonUnderline = builders.button('underline');
                    ltoobar.append(builders.buttonGroup([lbuttonBold, lbuttonItalic, lbuttonUnderline]));
                } else if (defaultToolBar[item] == 'color'){
                    //---color
                    btnExist.color = true;
                    lbuttonColor = builders.colorPicker('font', 'color', defaultColor);
                    lbuttonBgColor = builders.colorPicker('font', 'background-color', defaultBgColor);
                    ltoobar.append(builders.buttonGroup([lbuttonColor, lbuttonBgColor]));
                } else if (defaultToolBar[item] == 'align'){
                    //---align
                    btnExist.align = true;
                    lbuttonAlignLeft = builders.button('align-left');
                    lbuttonAlignCenter = builders.button('align-center');
                    lbuttonAlignRight = builders.button('align-right');
                    ltoobar.append(builders.buttonGroup([lbuttonAlignLeft, lbuttonAlignCenter, lbuttonAlignRight]));
                } else if (defaultToolBar[item] == 'list'){
                    //---list
                    btnExist.list = true;
                    lbuttonUl = builders.button('list-ul');
                    lbuttonOl = builders.button('list-ol');
                    ltoobar.append(builders.buttonGroup([lbuttonUl, lbuttonOl]));
                } else if (defaultToolBar[item] == 'link'){
                    //---link
                    btnExist.link = true;
                    lbuttonLink = builders.button('link');
                    lbuttonDelLink = builders.button('chain-broken');
                    ltoobar.append(builders.buttonGroup([lbuttonLink, lbuttonDelLink]));
                } else if (defaultToolBar[item] == 'insert'){
                    //---insert
                    btnExist.insert = true;
                    lbuttonImage = builders.button('image');
                    lbuttonCode = builders.button('code');
                    ltoobar.append(builders.buttonGroup([lbuttonImage, lbuttonCode]));
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
                                '    body{font-family:'+fonts[defaultFont]+'}'+
                                '    pre{'+
                                '    background-color: #eee;'+
                                '    padding: 10px;'+
                                '    border-radius: 4px;'+
                                '    }</style>'+
                                '</head>'+
                                '<body>'+
                                '</body>'+
                                '</html>');
            frameDocument.close();
            frameDocument.designMode = "on";
            frameDocument.execCommand('fontSize', false, defaultFontSize);
            frameDocument.execCommand('fontName', false, fonts[defaultFont]);
            window.onload = function () {
                if (frameDocument.designMode.toLowerCase() === 'off') {
                    frameDocument.designMode = 'on';
                }
            };
            
            /* set listeners */
            var selectedText;
            
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
                }
            };
            
            /* - text area */
            lframeWindow.click(funcs.moved)
                .keypress(funcs.keyPress)
                .keyup(funcs.moved);
            lframeDocument.find('body').keyup(funcs.addBr);
            
            /* - buttons */
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
        }
    });
})(window, document);