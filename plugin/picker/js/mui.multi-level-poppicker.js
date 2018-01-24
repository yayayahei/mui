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
		    <span class="mui-poppicker-header-text"></span>\
		   <div class="mui-poppicker-btn-close"><span class=" icon fa fa-times " style="font-size: 16px;"></span></div>\
		</div>\
		<div class="mui-poppicker-body">\
		<div class="mui-poppicker-nav">\
		<div class="mui-poppicker-title"></div>\
		</div>\
		</div>\
	</div>';
    var titleBuffer = '<h5 data-id="title"></h5>';
    var pickerBuffer = '<div class="mui-ulpicker">\
		<div class="mui-ulpicker-inner">\
            <div class="wrapper">\
                <ul class="content mui-ulpicker-list">\
                </ul>\
            </div>\
        </div>\
	</div>';

    //定义弹出选择器类
    var MultiLevelPopPicker = $.MultiLevelPopPicker = $.Class.extend({
        //构造函数
        init: function (options) {
            var self = this;
            self.options = options || {};
            self.options.panelTitle = self.options.panelTitle || '';
            self.panel = $.dom(panelBuffer)[0];
            document.body.appendChild(self.panel);
            self.headerText = self.panel.querySelector('.mui-poppicker-header-text');
            self.headerText.innerText = self.options.panelTitle;

            self.close = self.panel.querySelector('.mui-poppicker-btn-close');
            self.title = self.panel.querySelector('.mui-poppicker-title');
            self.body = self.panel.querySelector('.mui-poppicker-body');
            self.mask = $.createMask();
            self.close.addEventListener('tap', function (event) {
                self.hide();
            }, false);
            self.mask[0].addEventListener('tap', function () {
                self.hide();
            }, false);
            self._createPicker();
            //防止滚动穿透
            self.panel.addEventListener($.EVENT_START, function (event) {
                event.preventDefault();
            }, false);
            self.panel.addEventListener($.EVENT_MOVE, function (event) {
                event.preventDefault();
            }, false);
        },
        _createPicker: function () {
            var self = this;
            var layer = self.options.layer || 1;
            var titleWidthLayer = self.options.titleWidthLayer;
            var defaultTitles = self.options.defaultTitles || Array(layer).fill('请选择');
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
                            self.pickers[_id].bscroll.refresh();
                            self.pickers[_id].bscroll.scrollToElement('.choose');
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
                    console.log('choosed item:', event.detail.item,event);

                    var thisTitleElement = self.titles[id - 1];
                    thisTitleElement.innerText = preItem.text || defaultTitles[id - 1];
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
                                    self.pickers[_id].bscroll.refresh();
                                } else {
                                    // deactive other picker
                                    self.pickerElements[_id].classList.remove('active');
                                    // deactive other title
                                    self.titles[_id].classList.remove('active');

                                }
                            }
                        }

                    } else if (eventData.index > -1) {
                        // 点击最后一级
                        if (self.callback) {
                            var rs = self.callback(self.getSelectedItems());
                            if (rs !== false) {
                                self.hide();
                            }
                        }
                    }
                }, false);

                // const scroll = new BScroll(document.querySelector('.mui-ulpicker-inner'));
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
            document.documentElement.classList.add($.className('poppicker-active-for-page'));
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
            document.documentElement.classList.remove($.className('poppicker-active-for-page'));

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
                self.disposed = true;
            }, 300);
        }
    });

})(mui, document);