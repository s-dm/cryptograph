
import SettingView from '../Setting'
import StringUtil from '../../StringUtil'
import View from '../../View'

/**
 * Boolean Setting View.
 */
export default class BooleanSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    this._$input.checked = this.getModel().getValue()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('setting-boolean')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    let id = StringUtil.uniqueId()

    this._$input = View.createElement('input', {
      className: 'setting-boolean__input',
      type: 'checkbox',
      id: id,
      onChange: this.inputValueDidChange.bind(this),
      checked: this.getModel().getValue(),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    let $toggle = View.createElement('label', {
      className: 'setting-boolean__toggle',
      htmlFor: id
    }, [
      View.createElement('span', {
        className: 'setting-boolean__choice'
      }, this.getModel().getTrueLabel()),
      View.createElement('span', {
        className: 'setting-boolean__choice'
      }, this.getModel().getFalseLabel())
    ])

    let $field = super.renderField()
    $field.appendChild(this._$input)
    $field.appendChild($toggle)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // notify model
    this.getModel().viewValueDidChange(this, this._$input.checked)
  }
}
