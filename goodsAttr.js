/**
 * 商品多规格属性切换 - jquery
 * luochongfei
 * 2018-01-24 15:20:29
 */

class GoodsAttr {
    constructor(options) {
        this.settings = {
            // 商品列表
            goodsList: [],

            // 此功能作用区块范围 - jquery对象
            jqWrap: $('#wrap'),
            // 高亮（选中）className
            activeCls: 'active',
            // 禁用className
            disabledCls: 'disabled',
            // 每个质数项的属性名
            primeAttr: 'data-prime',
            // 每个属性行的 className
            rowCls: 'attr-row',

            // 成功匹配到商品
            success(product) {
                console.info(product);
            },
            // 未匹配到商品
            fail() {
                console.warn('Unmatched goods');
            },
        }

        const settings = Object.assign(this.settings, options || {});

        // 乘积初始值
        this.multiplyResult = 1;

        // 所有属性行的集合
        this.jqRows = settings.jqWrap.find('.' + settings.rowCls);
        // 所有选项集合
        this.jqItems = settings.jqWrap.find('[' + settings.primeAttr + ']');

        // 未找到行或项
        if (this.jqRows.length === 0 || this.jqItems.length === 0) {
            throw 'No line|items found';
        }

        // 执行初始化
        this.init();

        // 绑定事件
        this.bindEvent();
    }

    // 初始化
    init() {
        // 1.禁用所有非选中项
        this.disableAll();
        // 2.计算乘积
        this.multiplys();
        // 3.每行处理
        this.rowHandle();
        // 4.返回结果重
        this.resultHandle();
    }

    // 绑定事件
    bindEvent() {
        const self = this;
        const settings = this.settings;

        settings.jqWrap.on('click', '[' + settings.primeAttr + ']', function () {
            if ($(this).hasClass(settings.disabledCls)) {
                self.jqItems.removeClass(settings.activeCls);
            }
            $(this).addClass(settings.activeCls).siblings().removeClass(settings.activeCls);
            self.init();
        });
    }

    // 置灰所有未选中项
    disableAll() {
        const self = this;
        this.jqItems.each(function (index, item) {
            if (!$(item).hasClass(self.activeCls)) {
                $(item).addClass(self.disabledCls)
            }
        });
    }

    // 选中项乘积
    multiplys() {
        this.multiplyResult = 1;

        const self = this;
        const settings = this.settings;
        const $actives = settings.jqWrap.find('.' + settings.activeCls);

        $actives.each(function (index, item) {
            self.multiplyResult *= $(item).attr(settings.primeAttr);
        });
    }

    // 每行属性处理
    rowHandle() {
        const self = this;
        const settings = this.settings;

        // 遍历每一行
        self.jqRows.each(function (index, item) {
            // 当前行所有项
            let $items = $(item).find('[' + settings.primeAttr + ']');
            // 当前行的质数
            let currentRowPrime = $(item).find('.' + settings.activeCls).attr(settings.primeAttr) || 1;
            // 其他所有行选中项的乘积
            let otherRowPrimeMultiply = self.multiplyResult / currentRowPrime;

            // 给当前行可用项去除禁用
            self.removeDisable($items, otherRowPrimeMultiply);
        });
    }

    // 给一行可用项去除禁用
    removeDisable($items, otherRowPrimeMultiply) {
        const self = this;
        const settings = this.settings;
        $items.each(function (index, item) {
            let prime = $(item).attr(settings.primeAttr);
            let can = settings.goodsList.some(element => {
                return element.product_number % (prime * otherRowPrimeMultiply) === 0;
            });

            if (can) {
                $(item).removeClass(settings.disabledCls);
            } else {
                $(item).addClass(settings.disabledCls);
            }
        });
    }

    // 选中项乘积对应商品列表中的索引 不存在返回-1
    multiplyIndex() {
        // 计算乘积对应的key
        let idx = -1;
        const hasProduct = this.settings.goodsList.some((item, index) => {
            idx = index;
            return item.product_number == this.multiplyResult;
        });
        return hasProduct ? idx : -1;
    }

    //结果处理
    resultHandle() {
        const index = this.multiplyIndex();
        const settings = this.settings;

        if (index > -1) {
            const product = settings.goodsList[index];
            if (typeof settings.success === 'function') {
                settings.success(product);
            }
        } else {
            if (typeof settings.fail === 'function') {
                settings.fail();
            }
        }
    }
}