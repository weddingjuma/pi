import Ember from 'ember';
import IsUpdateDisabled from 'hospitalrun/mixins/is-update-disabled';
export default Ember.Controller.extend(IsUpdateDisabled, {
  editController: Ember.inject.controller('admin/lookup'),
  showUpdateButton: true,

  updateButtonAction: 'update',

  actions: {
    cancel: function() {
      this.send('closeModal');
    },

    update: function() {
      if (!Ember.isEmpty(this.get('model.value'))) {
        this.get('editController').send('updateValue', this.get('model'));
        this.send('closeModal');
      }
    }
  }
});
