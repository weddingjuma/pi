import Ember from 'ember';
import SelectValues from 'hospitalrun/utils/select-values';
export default Ember.Component.extend({
  name: 'select-or-typeahead',
  className: null,
  hint: true,
  label: null,
  list: null,
  optionLabelPath: 'value',
  optionValuePath: 'id',
  property: null,
  prompt: ' ',
  selection: null,
  setOnBlur: true,
  typeAheadType: null,

  content: function() {
    var list = this.get('list'),
      optionLabelPath = this.get('optionLabelPath'),
      optionValuePath = this.get('optionValuePath'),
      userCanAdd = this.get('userCanAdd');

    if (!Ember.isEmpty(list) && list.get) {
      var contentList = list.get('value');
      if (Ember.isEmpty(contentList)) {
        return [];
      }

      if (!userCanAdd && optionLabelPath === 'value' && optionValuePath === 'id') {
        return contentList.map(SelectValues.selectValuesMap);
      } else {
        return contentList;
      }
    }
  }.property('list'),

  usePricingTypeAhead: function() {
    return (this.get('typeAheadType') === 'pricing');
  }.property('typeAheadType'),

  userCanAdd: function() {
    var list = this.get('list');
    if (!Ember.isEmpty(list) && list.get) {
      return list.get('userCanAdd');
    } else {
      return true;
    }
  }.property('list')
});
