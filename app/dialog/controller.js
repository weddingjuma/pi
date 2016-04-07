import Ember from 'ember';
export default Ember.Controller.extend({
  showUpdateButton: true,
  isUpdateDisabled: false,

  actions: {
    cancel: function() {
      this.send('closeModal');
    },

    confirm: function() {
      var confirmAction = this.getWithDefault('model.confirmAction', 'model.confirm');
      this.send(confirmAction, this.get('model'));
      this.send('closeModal');
    },

    ok: function() {
      var okAction = this.get('model.okAction');
      if (!Ember.isEmpty(okAction)) {
        this.send(okAction, this.get('model'));
      }
      this.send('closeModal');
    }
  }
});
