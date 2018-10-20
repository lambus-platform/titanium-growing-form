const GrowingFormLayoutDimension = {
	LEFT_MARGIN: 0,
	RIGHT_MARGIN: 0,
	CONTENT_LEFT_MARGIN: 80,
	CONTENT_RIGHT_MARGIN: 8,
	CONTENT_TOP_MARGIN: 0,
	CONTENT_BOTTOM_MARGIN: 16,
};

const GrowingFormEvent = {
	STEP: 'step',
	SUBMIT: 'submit'
};

class FormError extends Error {}

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
			selectionStyle: 0
		});
		this.formView.add(this.tableView);

		// Configure the initial data set
		this._configureData();
	}

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

	_createContentView(cell, itemIndex = -1, isExpanded) {
		const title = cell.title;
		const type = cell.type;
		const identifier = cell.identifier;
		const options = cell.options;

		// The container view holds both the content-view and bullets
		const containerView = Ti.UI.createView({
			height: Ti.UI.SIZE,
			left: GrowingFormLayoutDimension.LEFT_MARGIN,
			right: GrowingFormLayoutDimension.RIGHT_MARGIN
		});

		const contentView = Ti.UI.createView({
			top: GrowingFormLayoutDimension.CONTENT_TOP_MARGIN,
			right: GrowingFormLayoutDimension.CONTENT_RIGHT_MARGIN,
			bottom: GrowingFormLayoutDimension.CONTENT_BOTTOM_MARGIN,
			left: GrowingFormLayoutDimension.CONTENT_LEFT_MARGIN,
			height: Ti.UI.SIZE,
			layout: 'vertical',
		});

		contentView.add(this._createTitleLabel(title));

		if (isExpanded) {
			switch (type) {
				case GrowingFormFieldType.TEXT: {
					contentView.add(this._createTextField(identifier, options));
					break;
				}
				default: {
					throw new FormError(`Unhandled cell type = ${type.toUpperCase()}`);
				}
			}

			contentView.add(this._createActionButton(itemIndex, {
				onClick: () => {
					this._selectNextCell();
				}
			}));
		}

		// Change the separator height based opn the content height, shesshh!
		containerView.addEventListener('postlayout', event => {
			separatorLine.height = event.source.rect.height.toFixed(0);
		});

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
			color: '#fff',
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
			// If the last element was a text-field, blur it!
			if (this.cells[this.expandedIndex].type === GrowingFormFieldType.TEXT && this.currentTextField) {
				this.currentTextField.blur();
			}
			if (this.callbacks[GrowingFormEvent.SUBMIT]) {
				this.callbacks[GrowingFormEvent.SUBMIT](this.formData);
			}
			return;
			// If not, yet, trigger the "step" callback
		} else if (this.callbacks[GrowingFormEvent.STEP]) {
			this.callbacks[GrowingFormEvent.STEP](this.expandedIndex + 1);
		}

		this.expandedIndex++;
		this._configureData();
	}

	_createTextField(identifier, options = {}) {
		const textField = Ti.UI.createTextField({
			top: 8,
			left: 0,
			width: 280,
			height: 40,
			color: '#000',
			hintTextColor: '#bebebe',
			padding: { left: 16 },
			borderRadius: 4,
			backgroundColor: '#eee'
		});

		// Reference a reference in our scope to blur it, if it is the last form input
		this.currentTextField = textField;
		textField.applyProperties(options);

		textField.addEventListener('change', event => {
			this.formData[identifier] = event.value;
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

	_createActionButton(itemIndex, options = {}) {
		const actionButton = Ti.UI.createButton({
			title: L('Continue', 'Continue'),
			width: 120,
			height: 40,
			borderRadius: 20,
			backgroundColor: this.options.stepButtonBackgroundColor,
			color: '#fff',
			top: 10,
			left: 0
		});

		if (itemIndex === this.cells.length - 1) {
			actionButton.title = L('Submit', 'Submit');
			actionButton.backgroundColor = this.options.submitButtonBackgroundColor;
		}

		actionButton.addEventListener('click', options.onClick);

		return actionButton;
	}
}

const GrowingFormFieldType = {
	TEXT: 'text',
	CHECKBOX: 'checkbox',
	DROPDOWN: 'dropdown'
};

export { GrowingForm, GrowingFormFieldType };
