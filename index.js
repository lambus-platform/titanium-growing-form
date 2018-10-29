/* global L */

const GrowingFormLayoutDimension = {
	LEFT_MARGIN: 0,
	RIGHT_MARGIN: 0,
	CONTENT_LEFT_MARGIN: 80,
	CONTENT_RIGHT_MARGIN: 8,
	CONTENT_TOP_MARGIN: 0,
	CONTENT_BOTTOM_MARGIN: 16,
	CONTENT_INACTIVE_BOTTOM_MARGIN: 32
};

const GrowingFormEvent = {
	STEP: 'step',
	SUBMIT: 'submit'
};

const GrowingFormValidationRule = {
	ALLOW_EMPTY: 'allow_empty',
	NOT_EMPTY: 'empty',
	EMAIL: 'email',
	NUMERIC: 'numeric',
	LIVE: 'live'
};

class FormError extends Error {}

class FormValidationError extends FormError {}

class GrowingForm {

	constructor(options = {}) {
		// Access configuration parameters, perform some basic validation
		const configuration = options.configuration;
		const cells = configuration.cells;

		if (!configuration) {
			throw new FormError('Missing \'configuration\' parameter');
		}
		if (!cells) {
			throw new FormError('Missing \'cells\' parameter in \'configuration\'');
		}

		// Link some additional options like bullet styling
		this.options = configuration.options || {};

		// Create root view
		this.formView = Ti.UI.createView();

		// Initialize the form-data
		this.formData = {};

		// This flag is used to block UI interactions after submitting the form
		this.locked = false;

		// Style the root view with optional overrides
		const overrides = configuration.overrides || {};
		this.formView.applyProperties(overrides);

		// Set the initial expanded data
		this.expandedIndex = 0;
		this.cells = cells;

		// Configure the callbacks object to be used by "on" and "off" methods
		this.callbacks = {};

		// Create the container table-view with our data source
		this.tableView = Ti.UI.createTableView({
			backgroundColor: 'transparent',
			separatorStyle: Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE,
			selectionStyle: 0,
			headerView: Ti.UI.createView({ height: this.options.tableTopMargin || 0 })
		});
		this.formView.add(this.tableView);

		// Configure the initial data set
		this._configureData();
	}

	/* PUBLIC API's */

	on(eventName, cb) {
		if (this.callbacks[eventName] !== undefined) {
			throw new FormError('Duplicate event listener found. Please use \'off\' to clean up your listener');
		}
		this.callbacks[eventName] = cb;
	}

	off(eventName, cb) {
		if (this.callbacks[eventName] === undefined || this.callbacks[eventName] !== cb) {
			throw new FormError('No event listener found. Please use \'on\' to configure up your listener');
		}
		delete this.callbacks[eventName];
	}

	openStep(identifier) {
		if (!identifier) {
			throw new FormError('Missing \'identifier\'');
		}

		if (this.locked) {
			throw new FormError('Trying to open a step in a locked state');
		}

		let step = 0;
		const oldExpandedIndex = this.expandedIndex;

		this.cells.forEach(cell => {
			if (cell.identifier === identifier) {
				this.expandedIndex = step;
			}
			step++;
		});

		// Only re-draw if necessary
		if (oldExpandedIndex !== this.expandedIndex) {
			this._configureData();
		}
	}

	render(options = {}) {
		const view = options.view;

		// Validate container view
		if (!view) {
			throw new FormError('Missing required \'view\' parameter');
		}

		// Validate of the instance of this form has already been rendered in the container
		view.children.forEach(child => {
			if (child === this.formView) {
				throw new FormError('Cannot render form in container view twice');
			}
		});

		// Add the instance of this form to the container
		view.add(this.formView);
	}

	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}

	focus() {
		if (!this.currentTextField) {
			throw new FormError('Trying to focus a field that is not a text-field');
		}
		this.currentTextField.focus();
	}

	blur() {
		if (!this.currentTextField) {
			throw new FormError('Trying to blur a field that is not a text-field');
		}
		this.currentTextField.blur();
	}

	submit() {
		if (this.expandedIndex !== this.cells.length - 1) {
			throw new FormError('Trying to submit as form that did not reach it\'s end so far');
		}

		// If the last element was a text-field, blur it!
		if (this.cells[this.expandedIndex].type === GrowingFormFieldType.TEXT && this.currentTextField) {
			this.currentTextField.blur();
		}
		if (this.callbacks[GrowingFormEvent.SUBMIT]) {
			this.callbacks[GrowingFormEvent.SUBMIT](this.formData);
		}
		this.locked = true;
	}

	/* PRIVATE API's */

	_configureData() {
		let data = [];
		let itemIndex = 0;

		this.cells.forEach(cell => {
			// Perform cell validation
			if (!cell.title) {
				throw new FormError('Missing \'title\' parameter in cell configuration');
			}
			if (!cell.type) {
				throw new FormError('Missing \'type\' parameter in cell configuration');
			}
			if (!cell.identifier) {
				throw new FormError('Missing \'identifier\' parameter in cell configuration');
			}

			// Create a basic row
			const row = Ti.UI.createTableViewRow({ height: Ti.UI.SIZE });

			// Create and assign the content view
			const contentView = this._createContentView(cell, itemIndex, itemIndex === this.expandedIndex);
			row.add(contentView);

			// Push the row to our data source
			data.push(row);
			itemIndex++;
		});

		this.tableView.data = data;
	}

	_createContentView(cell, itemIndex = -1, isExpanded) {
		const title = cell.title;
		const type = cell.type;

		let textField;
		let actionButton;

		// The container view holds both the content-view and bullets
		const containerView = Ti.UI.createView({
			height: Ti.UI.SIZE,
			left: GrowingFormLayoutDimension.LEFT_MARGIN,
			right: GrowingFormLayoutDimension.RIGHT_MARGIN
		});

		const contentView = Ti.UI.createView({
			top: GrowingFormLayoutDimension.CONTENT_TOP_MARGIN,
			right: GrowingFormLayoutDimension.CONTENT_RIGHT_MARGIN,
			bottom: isExpanded ? GrowingFormLayoutDimension.CONTENT_BOTTOM_MARGIN : GrowingFormLayoutDimension.CONTENT_INACTIVE_BOTTOM_MARGIN,
			left: GrowingFormLayoutDimension.CONTENT_LEFT_MARGIN,
			height: Ti.UI.SIZE,
			layout: 'vertical',
		});

		contentView.add(this._createTitleLabel(title));

		// Only add content if expanded
		if (isExpanded) {
			switch (type) {
				case GrowingFormFieldType.TEXT: {
					textField = this._createTextField({
						cell: cell,
						onChange: isValid => {
							this.formData[cell.identifier] = textField.value;

							// If we use live-validation, do not update our UI so far
							if (cell.validate === GrowingFormValidationRule.LIVE) {
								const throttle = cell.throttle;
								if (!throttle || typeof throttle !== 'function') {
									throw new FormError('using live validation without padding \'throttle\' method');
								}
								throttle(textField, actionButton);
								return;
							}

							actionButton.opacity = isValid ? 1.0 : 0.3;
							actionButton.enabled = isValid;
						}
					});
					contentView.add(textField);
					break;
				}
				default: {
					throw new FormError(`Unhandled cell type = ${type.toUpperCase()}`);
				}
			}

			actionButton = this._createActionButton(cell, itemIndex, {
				onClick: () => {
					this._selectNextCell();
				}
			});
			contentView.add(actionButton);
		}

		// Change the separator height based opn the content height, shesshh!
		containerView.addEventListener('postlayout', event => {
			separatorLine.height = event.source.rect.height.toFixed(0);
		});

		// Make previous cells expandable (for later form entries)
		if (!isExpanded && itemIndex <= this.expandedIndex && !this.locked) {
			containerView.addEventListener('click', () => {
				// Since the event listener is async, the locking can change between
				// rendering the forms and interacting with it
				if (this.locked) {
					return;
				}

				this.expandedIndex = itemIndex;
				this._configureData();

				if (this.callbacks[GrowingFormEvent.STEP]) {
					const cell = this.cells[this.expandedIndex];
					this.callbacks[GrowingFormEvent.STEP](this.currentTextField, this.expandedIndex, this._validateFromType(cell, this.formData[cell.identifier]));
				}
			});
		}

		const bulletView = Ti.UI.createView({
			width: 36,
			height: 36,
			backgroundColor: isExpanded ? this.options.bulletActiveBackgroundColor : this.options.bulletInactiveBackgroundColor,
			borderRadius: 18,
			top: 0,
			center: {
				x: GrowingFormLayoutDimension.CONTENT_LEFT_MARGIN / 2.0
			}
		});

		const separatorLine = Ti.UI.createView({
			top: 0,
			left: GrowingFormLayoutDimension.CONTENT_LEFT_MARGIN / 2.0,
			width: 1,
			height: Ti.UI.SIZE,
			backgroundColor: '#ccc',
			bottom: 0
		});

		bulletView.add(Ti.UI.createLabel({
			text: `${itemIndex + 1}`,
			color: isExpanded ? this.options.bulletActiveTextColor : this.options.bulletInactiveTextColor,
			font: {
				fontSize: 12
			}
		}));

		containerView.add(contentView);

		// Do not add the separator line for the last item
		if (itemIndex !== this.cells.length - 1) {
			containerView.add(separatorLine);
		}

		containerView.add(bulletView);

		return containerView;
	}

	_selectNextCell() {
		// If we are done, trigger the "submit" callback
		if (this.expandedIndex === this.cells.length - 1) {
			this.submit();
			return;
			// If not, yet, trigger the "step" callback
		} else if (this.callbacks[GrowingFormEvent.STEP]) {
			const cell = this.cells[this.expandedIndex + 1];
			const value = this.formData[cell.identifier];

			this.callbacks[GrowingFormEvent.STEP](this.currentTextField, this.expandedIndex + 1, this._validateFromType(cell, value));
		}

		this.expandedIndex++;
		this._configureData();
	}

	_createTextField(args) {
		const cell = args.cell;
		const onChangeCallback = args.onChange;
		const identifier = cell.identifier;
		const validate = cell.validate;
		const options = cell.options || {};

		const textField = Ti.UI.createTextField({
			top: 8,
			left: 0,
			width: 280,
			height: 40,
			color: '#000',
			hintTextColor: '#bebebe',
			padding: { left: 16 },
			borderRadius: 4,
			backgroundColor: '#eee',
			value: this.formData[identifier] || ''
		});

		// Reference a reference in our scope to blur it, if it is the last form input
		this.currentTextField = textField;
		textField.applyProperties(options);

		textField.addEventListener('change', event => {
			const value = event.value;

			// Check if we have a validator
			if (validate !== undefined) {
				const isValid = this._validateFromType(cell, value);
				onChangeCallback(isValid);
			}
		});

		return textField;
	}

	_createTitleLabel(title = L('Select')) {
		const titleLabel = Ti.UI.createLabel({
			top: 6,
			left: 0,
			color: '#000',
			text: title
		});

		return titleLabel;
	}

	_createActionButton(cell, itemIndex, options = {}) {
		// If no validation rules are set, we assume the cell should not be validated
		const isInitiallyValid = this._validateFromType(cell, this.formData[cell.identifier] || '');

		const actionButton = Ti.UI.createButton({
			title: this.options.stepButtonTitle || L('Continue', 'Continue'),
			enabled: isInitiallyValid,
			opacity: isInitiallyValid ? 1.0 : 0.3,
			width: 120,
			height: 40,
			borderRadius: this.options.stepButtonBorderRadius,
			backgroundColor: this.options.stepButtonBackgroundColor,
			color: this.options.stepButtonTextColor,
			top: 10,
			left: 0
		});

		if (itemIndex === this.cells.length - 1) {
			actionButton.title = this.options.submitButtonTitle || L('Submit', 'Submit');
			actionButton.backgroundColor = this.options.submitButtonBackgroundColor;
			actionButton.color = this.options.submitButtonTextColor;
			actionButton.borderRadius = this.options.submitButtonBorderRadius;
		}

		actionButton.addEventListener('click', options.onClick);

		return actionButton;
	}

	_validateFromType(cell, value) {
		const validator = cell.validate;

		// If we have a validation function, invoke it
		if (this._isFunction(validator)) {
			return validator(value);
		}

		// If we have a constant, switch-case it
		if (!typeof validator === 'string') {
			throw new FormValidationError(`Invalid validator type = ${typeof validator}`);
		}

		// TODO: Make this more generic to handle fields received via "cell.type"

		switch (validator) {
			case GrowingFormValidationRule.NOT_EMPTY: {
				return value.toString().trim().length > 0;
			}
			case GrowingFormValidationRule.EMAIL: {
				return this._isValidEmail(value);
			}
			case GrowingFormValidationRule.NUMERIC: {
				return !isNaN(parseFloat(value)) && !isNaN(value - 0);
			}
			case GrowingFormValidationRule.LIVE: {
				return this.formData[cell.identifier] && this.formData[cell.identifier].length > 0;
			}
			default: {
				throw new FormValidationError(`Unhandled form validator = ${validator}`);
			}
		}
	}

	_isValidEmail(email) {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	_isFunction(functionToCheck) {
		return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
	}
}

const GrowingFormFieldType = {
	TEXT: 'text',
	CHECKBOX: 'checkbox',
	DROPDOWN: 'dropdown'
};

export { GrowingForm, GrowingFormFieldType, GrowingFormValidationRule };
