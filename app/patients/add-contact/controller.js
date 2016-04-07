import Ember from 'ember';
import IsUpdateDisabled from 'hospitalrun/mixins/is-update-disabled';
export default Ember.Controller.extend(IsUpdateDisabled, {
  patientsEdit: Ember.inject.controller('patients/edit'),
  editController: Ember.computed.alias('patientsEdit'),
  title: 'Add Contact',
  updateButtonText: 'Add',
  updateButtonAction: 'add',
  showUpdateButton: true,

  actions: {
    cancel: function() {
      this.send('closeModal');
    },

    add: function() {
      var newContact = this.getProperties('name', 'phone', 'email', 'relationship');
      this.get('editController').send('addContact', newContact);
    }
  }
});
