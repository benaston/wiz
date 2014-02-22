(function (invertebrate, $) {
  'use strict';

  function App(templateServerSvc) {
    if (!(this instanceof invertebrate.App)) {
      return new invertebrate.App(templateServerSvc);
    }

    var that = this,
        _templateServerSvc = null,
        _templatePostRenderScripts = {};

    //implements trivial string-based modularisation
    that.mod = function () {
      var mods = {};

      return function (name) {
        if (mods[name]) {
          return mods[name];
        }

        return mods[name] = {};
      };
    }();

    //fetches a template from a URI, adds to 'public'
    //templates collection and supplies to success callback
    that.fetchTemplate = function (uri, options) {
      if (!options) {
        throw 'options not supplied';
      }

      var defaultOptions = {
        done: function (metadata) {
        },
        fail: function (jqxhr, settings, exception) {
          console.log(exception);
          throw exception;
        }
      },
      done = options.done,
      ajaxDoneCallback = function (data) {
        var tmpl = _.template(data);
        that.templates[uri] = tmpl;
        done(tmpl);
      },
      ajaxFailCallback = function (jqxhr, settings, exception) {
        console.log(jqxhr.status);
      };

      options = _.extend({}, defaultOptions, options);
      that.templates = that.templates || {};

      if (that.templates[uri]) {
        return done(that.templates[uri]);
      }

      return $.ajax({ url: uri, cache: false })
          .done(ajaxDoneCallback)
          .fail(ajaxFailCallback);
    };

    that.renderTemplate = function ($el, templateName, model, options) {
      var defaults = {
        done: function ($el) {
        },
        error: function (jqxhr, settings, exception) {
          console.log(exception);
          throw exception;
        },
        postRenderActionScriptUri: null };
      options = _.extend({}, defaults, options);

      if (!$el) {
        throw '$el1 not supplied';
      }
      if (!model) {
        throw 'model not supplied';
      }

      var templateUri = _templateServerSvc.getTemplateUri(templateName);
      //could modify to use self cache
      that.fetchTemplate(templateUri, { done: function (tmpl) {
        $el.html(tmpl({ model: _.clone(model) }, { jQuery: $ }));

        if (options.postRenderScriptName) {
          var postRenderScriptUri = _templateServerSvc.getPostRenderScriptUri(options.postRenderScriptName);
          that.fetchTemplatePostRenderScript(postRenderScriptUri, function (data) {
            _templatePostRenderScripts[postRenderScriptUri]($, $el);
            options.done($el); //NOTE: this is in correct location (really)! Purpose: supply $el1 for possible additional work, like dom insertion
          });
        } else {
          options.done($el); //complete for when there is no post-render action script
        }
      }});
    };

    //invoked by this.renderTemplate if a post-render action script is specified.
    that.fetchTemplatePostRenderScript = function (uri, done) {
      if (!uri) {
        throw 'uri not supplied.';
      }
      if (!done) {
        throw 'done not supplied.';
      }

      if (_templatePostRenderScripts[uri]) {
        return done(_templatePostRenderScripts[uri]);
      }

      return $.ajax({url: uri, dataType: 'text', cache: false, success: function (data, textStatus, jqXHR) {
        _templatePostRenderScripts[uri] = eval(data).postRenderScript; //use Function
        done(data);
      }}).fail(function (jqxhr, settings, exception) {
            console.log(exception);
          });
    };

    function init() {
      if (!templateServerSvc) {
        throw 'templateServerSvc not supplied';
      }

      _templateServerSvc = templateServerSvc;
      return that;
    }

    return init();
  }

  invertebrate.App = App;
}(invertebrate, $));
