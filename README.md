# Growing ("Stepper") Form for Titanium

<img src="./screenshots/screenshot.png" width="900" alt="Example" />

A form that expands / collapses based on the current input field. Also known as "growing form" or "stepper form".

## Requirements

- [x] Titanium SDK (`npm i titanium`)
- [x] ES6+ enabled (`<transpile>true</transpile>`)

## Installation

1. Via npm: `npm i ti.growingform`
2. Manually: Copy to `app/lib/` (Alloy) or `Resources/` (classic)

## Example

```js
import { GrowingForm, GrowingFormValidationRule, GrowingFormFieldType } from 'ti.growingform';

const config = {
	cells: [{
		title: 'Your Username',
		identifier: 'username',
		type: GrowingFormFieldType.TEXT,
    validate: GrowingFormValidationRule.LIVE,
    throttle: handleUsernameThrottle,
    options: {
			hintText: 'Enter username ...'
		}
	}, {
		title: 'Your Mail address',
		identifier: 'email',
		type: GrowingFormFieldType.TEXT,
		validate: GrowingFormValidationRule.EMAIL,
		options: {
			keyboardType: Ti.UI.KEYBOARD_TYPE_EMAIL,
			hintText: 'Enter mail address ...'
		}
	}, {
		title: 'Your Password',
		identifier: 'password',
		type: GrowingFormFieldType.TEXT,
		validate: value => {
			// CREDITS: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
			const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
			return strongRegex.test(value);
		},
		options: {
			passwordMask: true,
			hintText: 'Enter password ...'
		}
	}],
	options: {
    // Style the underlaying table-view via it's header-view
    tableTopMargin: 50,

		// Bullets
		bulletInactiveBackgroundColor: '#666',
		bulletInactiveTextColor: '#fff',
		bulletActiveBackgroundColor: '#000',
		bulletActiveTextColor: '#fff',

		// Step button (aka "Continue")
		stepButtonTitle: L('Continue', 'Continue'),
		stepButtonBackgroundColor: '#333',
		stepButtonTextColor: '#fff',
		stepButtonBorderRadius: 20,

		// Step button (aka "Submit")
		submitButtonTitle: L('Submit', 'Submit'),
		submitButtonBackgroundColor: 'orange',
		submitButtonTextColor: '#fff',
		submitButtonBorderRadius: 20
	},
	overrides: {
		// backgroundColor: 'green'
	} 
};

function handleUsernameThrottle(textField, submitButton) {
    // Do a HTTP request to validate the text-field value
    // and enable / disable the submit button as below
    submitButton.enabled = true;
    submitButton.opacity = 1.0
}

const growingForm = new GrowingForm({ configuration: config });

growingForm.on('submit', data => {
	Ti.API.info(`Finished form! Data: ${JSON.stringify(data)}`)
});

growingForm.on('step', index => {
	Ti.API.info(`Stepped to ${index}`)
});

growingForm.render({ view: $.index });
```

## API

All methods and properties are accessed from the `GrowingForm` instance

### Methods

|   Name   | Arguments  |   Description  |
|----------|------------|----------------|
| lock     |            | Locks the form |
| unlock   |            | Unlocks the form |
| openStep | identifier | Moves back to a step, crawled by it's identifier |
| focus    |            | Focuses the current field (only if the field is a text-field) |
| blur     |            | Blurs the current field (only if the field is a text-field) |
| submit   |            | Submits the form programmatically |

## License

MIT

## Author

Hans Knöchel (Lambus GmbH)
