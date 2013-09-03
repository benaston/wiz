"use strict";

(function (app) {

    function ContractView(model) {

        if (!(this instanceof app.ContractView)) {
            return new app.ContractView(model);
        }

        var that = this,
            _el = "<li class='thumbnail thumbnail-219' data-id='" + model.Id + "'></li>",
            _templateName = "result.html";

        this.$el = $(_el);
        this.Model = null;

        this.render = function (options) {
            options = options || { done: that.postRender };

            app.instance.renderTemplate(that.$el, _templateName, that.Model, {
                done: function ($el) {
                    that.bindEvents($el, options.done);
                }
            });
        };

        this.postRender = function () {
        };

        this.bindEvents = function ($el, done) {
            that.$el.on('click', function () {
                app.instance.resultList.Model.setSelectedItem(that.$el.data("id"));
            });

            done($el);
        };

        function init() {
            if (!model) {
                throw "model not supplied";
            }

            that.Model = model;

            return that;
        }

        return init();
    };

    app.ContractView = ContractView;
    invertebrate.View.isExtendedBy(app.ContractView);
}(wizerati));
