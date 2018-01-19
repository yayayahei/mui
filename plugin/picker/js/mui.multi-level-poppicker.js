/**
 * 弹出选择列表插件
 * 此组件依赖 listpcker ，请在页面中先引入 mui.picker.css + mui.picker.js
 * varstion 1.0.0
 * by yayayahei
 * mmwcbz@msn.cn
 */

(function ($, document) {

    //创建 DOM
    $.dom = function (str) {
        if (typeof(str) !== 'string') {
            if ((str instanceof Array) || (str[0] && str.length)) {
                return [].slice.call(str);
            } else {
                return [str];
            }
        }
        if (!$.__create_dom_div__) {
            $.__create_dom_div__ = document.createElement('div');
        }
        $.__create_dom_div__.innerHTML = str;
        return [].slice.call($.__create_dom_div__.childNodes);
    };

    var panelBuffer = '<div class="mui-poppicker">\
		<div class="mui-poppicker-header">\
			<button class="mui-btn mui-poppicker-btn-cancel">取消</button>\
			<button class="mui-btn mui-btn-blue mui-poppicker-btn-ok">确定</button>\
			<div class="mui-poppicker-clear"></div>\
		</div>\
		<div class="mui-poppicker-title"></div>\
		<div class="mui-poppicker-body">\
		</div>\
	</div>';
    var titleBuffer = '<h5 data-id="title"></h5>';
    var pickerBuffer = '<div class="mui-ulpicker">\
		<div class="mui-ulpicker-inner">\
			<ul class="mui-ulpicker-list">\
			</ul>\
		</div>\
	</div>';

    //定义弹出选择器类
    var MultiLevelPopPicker = $.MultiLevelPopPicker = $.Class.extend({
        //构造函数
        init: function (options) {
            var self = this;
            self.options = options || {};
            self.options.buttons = self.options.buttons || ['取消', '确定'];
            self.panel = $.dom(panelBuffer)[0];
            document.body.appendChild(self.panel);
            self.ok = self.panel.querySelector('.mui-poppicker-btn-ok');
            self.cancel = self.panel.querySelector('.mui-poppicker-btn-cancel');
            self.title = self.panel.querySelector('.mui-poppicker-title');
            self.body = self.panel.querySelector('.mui-poppicker-body');
            self.mask = $.createMask();
            self.cancel.innerText = self.options.buttons[0];
            self.ok.innerText = self.options.buttons[1];
            self.cancel.addEventListener('tap', function (event) {
                self.hide();
            }, false);
            self.ok.addEventListener('tap', function (event) {
                if (self.callback) {
                    var rs = self.callback(self.getSelectedItems());
                    if (rs !== false) {
                        self.hide();
                    }
                }
            }, false);
            self.mask[0].addEventListener('tap', function () {
                self.hide();
            }, false);
            self._createPicker();
            //防止滚动穿透
            // self.panel.addEventListener($.EVENT_START, function (event) {
            //     event.preventDefault();
            // }, false);
            self.panel.addEventListener($.EVENT_MOVE, function (event) {
                // 如果event puath 不包含pop picker body 则阻止
                console.log('move in panel', event);
                var bodyTags = event.path.some(function (value, index) {
                    try {
                        return value.classList.contains('mui-poppicker-body');
                    } catch (e) {
                        return false;
                    }

                });
                if (!bodyTags) {
                    event.preventDefault();
                }

            }, false);
        },
        _createPicker: function () {
            var self = this;
            var layer = self.options.layer || 1;
            var titleWidthLayer = self.options.titleWidthLayer;
            var defaultTitles=self.options.defaultTitles||['请选择','请选择','请选择'];
            var width = '100%';
            self.pickers = [];
            self.titles = [];
            self.pickerElements = [];
            for (var i = 1; i <= layer; i++) {
                var pickerElement = $.dom(pickerBuffer)[0];
                pickerElement.setAttribute("data-id", i);
                pickerElement.style.width = width;
                // append title
                var titleElement = $.dom(titleBuffer)[0];
                titleElement.innerText = defaultTitles[i - 1];
                titleElement.setAttribute("data-id", i);
                if (titleWidthLayer) {
                    titleElement.style.width = titleWidthLayer[i - 1] + '%';
                }
                if (i === 1) {
                    titleElement.classList.add('active');
                    pickerElement.classList.add('active');
                }
                titleElement.addEventListener('tap', function (event) {
                    var id = Number(this.getAttribute("data-id"));
                    var index = Number(this.getAttribute("data-value"));
                    var prevIndex = this.previousSibling && Number(this.previousSibling.getAttribute("data-value"));
                    // console.log(prevIndex);
                    for (var _id = 0; _id < layer; _id++) {
                        if (_id + 1 === id) {
                            // active this title
                            self.pickerElements[_id].classList.add('active');
                            // display corresponding picker,
                            self.titles[_id].classList.add('active');

                        } else {
                            // deactive other picker
                            self.pickerElements[_id].classList.remove('active');
                            // deactive other title
                            self.titles[_id].classList.remove('active');

                        }
                    }
                    // if (id > 1) {
                    //     self.pickers[id - 1].triggerChange();
                    // }
                }, false);
                self.title.appendChild(titleElement);
                self.titles.push(titleElement);
                self.pickerElements.push(pickerElement);
                self.body.appendChild(pickerElement);
                var picker = $(pickerElement).ulpicker();
                self.pickers.push(picker);
                pickerElement.addEventListener('change', function (event) {
                    // console.log('change event',event);
                    var id = Number(this.getAttribute("data-id"));
                    var eventData = event.detail || {};
                    var preItem = eventData.item || {};

                    var thisTitleElement = self.titles[id - 1];
                    thisTitleElement.innerText = preItem.text||defaultTitles[id-1];
                    thisTitleElement.setAttribute('data-value', eventData.index);
                    var nextPickerElement = this.nextSibling;
                    if (nextPickerElement && nextPickerElement.ulpicker) {
                        nextPickerElement.ulpicker.setItems(preItem.children);
                        nextPickerElement.ulpicker.setSelectedIndex(-1);
                        // show next picker
                        if (eventData.index > -1) {
                            for (var _id = 0; _id < layer; _id++) {
                                if (_id === id) {
                                    // active this title
                                    self.pickerElements[_id].classList.add('active');
                                    // display corresponding picker,
                                    self.titles[_id].classList.add('active');

                                } else {
                                    // deactive other picker
                                    self.pickerElements[_id].classList.remove('active');
                                    // deactive other title
                                    self.titles[_id].classList.remove('active');

                                }
                            }
                        }

                    }
                }, false);
            }
        },
        //填充数据
        setData: function (data) {
            var self = this;
            data = data || [];
            self.pickers[0].setItems(data);
        },
        //获取选中的项（数组）
        getSelectedItems: function () {
            var self = this;
            var items = [];
            for (var i in self.pickers) {
                var picker = self.pickers[i];
                items.push(picker.getSelectedItem() || {});
            }
            return items;
        },
        //显示
        show: function (callback) {
            var self = this;
            self.callback = callback;
            self.mask.show();
            document.body.classList.add($.className('poppicker-active-for-page'));
            // document.classList.add($.className('poppicker-active-for-page'));
            self.panel.classList.add($.className('active'));
            //处理物理返回键
            self.__back = $.back;
            $.back = function () {
                self.hide();
            };
        },
        //隐藏
        hide: function () {
            var self = this;
            if (self.disposed) return;
            self.panel.classList.remove($.className('active'));
            self.mask.close();
            document.body.classList.remove($.className('poppicker-active-for-page'));
            // document.classList.remove($.className('poppicker-active-for-page'));
            //处理物理返回键
            $.back = self.__back;
        },
        dispose: function () {
            var self = this;
            self.hide();
            setTimeout(function () {
                self.panel.parentNode.removeChild(self.panel);
                for (var name in self) {
                    self[name] = null;
                    delete self[name];
                }
                ;
                self.disposed = true;
            }, 300);
        }
    });

})(mui, document);