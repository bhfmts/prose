var $ = require('jquery-browserify');
var _ = require('underscore');
var Backbone = require('backbone');
var NavView = require('../nav');
var templates = require('../../../dist/templates');
var utils = require('../../util');

module.exports = Backbone.View.extend({
    subviews: [],

    events: {
      'click a.save': 'save',
      'click a.cancel': 'cancel',
      'click a.confirm': 'updateFile',
      'click a.delete': 'deleteFile',
      'click a.translate': 'translate',
      'click a.draft': 'draft',
      'focus input.filepath': 'checkPlaceholder',
      'keypress input.filepath': 'saveFilePath'
    },

    initialize: function(options) {
      this.user = options.user;
    },

    render: function(options) {
      var view = this;
      var isJekyll = false;
      var errorPage = false;
      var hideInterface = false; // Flag for unauthenticated landing
      this.noMenu = false; // Prevents a mobile toggle from appearing when nto required.

      if (options) {
        if (options.hideInterface) hideInterface = options.hideInterface;
        if (options.jekyll) isJekyll = options.jekyll;
        if (options.noMenu) this.noMenu = options.noMenu;
        if (options.error) errorPage = options.error;
      }

      if (hideInterface) {
        $(this.el).toggleClass('disable-interface', true);
      } else {
        $(this.el).toggleClass('disable-interface', false);
      }

      $(this.el).empty().append(this.template(_.extend(this.model, app.state, {
        jekyll: isJekyll,
        error: errorPage,
        noMenu: view.noMenu,
        lang: (app.state.file) ? utils.mode(app.state.file) : undefined
      })));

      return this;
    },

    deleteFile: function(e) {
      this.eventRegister.trigger('deleteFile', e);
      return false;
    },

    translate: function(e) {
      this.eventRegister.trigger('translate', e);
      return false;
    },
    
    draft: function(e) {
      this.eventRegister.trigger('draft', e);
      return false;
    },

    save: function(e) {
      var tmpl = _(app.templates.sidebarSave).template();
      this.eventRegister.trigger('showDiff', e);

      if ($(e.target, this.el).hasClass('active')) {
        this.cancel();
      } else {
        $('.navigation a', this.el).removeClass('active');
        $(e.target, this.el).addClass('active');

        $('#drawer', this.el)
          .empty()
          .append(tmpl({
            writable: this.writable
        }));

        $('#prose').toggleClass('open mobile', true);

        var $message = $('.commit-message', this.el);
        var filepath = $('input.filepath').val();
        var filename = _.extractFilename(filepath)[1];
        var placeholder = 'Updated ' + filename;
        if (app.state.mode === 'new') placeholder = 'Created ' + filename;
        $message.attr('placeholder', placeholder).focus();
      }

      return false;
    },

    cancel: function(e) {
      $('.navigation a', this.el).removeClass('active');
      $('.navigation .' + app.state.mode, this.el).addClass('active');
      $('#prose').toggleClass('open mobile', false);
      this.eventRegister.trigger('cancelSave', e);
      return false;
    },

    updateFile: function(e) {
      this.eventRegister.trigger('updateFile', e);
      return false;
    },

    saveFilePath: function(e) {
      // Trigger updateFile when a return button has been pressed.
      if (e.which === 13) this.eventRegister.trigger('updateFile', e);
    },

    checkPlaceholder: function(e) {
      if (app.state.mode === 'new') {
        var $target = $(e.target, this.el);
        if (!$target.val()) {
          $target.val($target.attr('placeholder'));
        }
      }
    },

    updateSaveState: function(label, classes, kill) {
      var view = this;

      // Cancel if this condition is met
      if (classes === 'save' && $(this.el).hasClass('saving')) return;
      $('.button.save', this.el).html(label);

      // Pass a popover span to the avatar icon
      $('#heading', this.el).find('.popup').html(label);
      $('.action').find('.popup').html(label);

      $(this.el)
        .removeClass('error saving saved save')
        .addClass(classes);

      if (kill) {
        _.delay(function() {
          $(view.el).removeClass(classes);
        }, 1000);
      }
    },

    remove: function() {
      _.invoke(this.subviews, 'remove');
      this.subviews = [];

      Backbone.View.prototype.remove.apply(this, arguments);
    }
});
