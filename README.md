# Growing ("Stepper") Form for Titanium

<img src="./screenshots/screenshot.png" width="900" alt="Example" />

A form that expands / collapses based on the current input field. Also known as "growing form" or "stepper form".

⚠️ This project is currently work in progress and should not be used in production so far.

## Requirements

- [x] Titanium SDK (`npm i titanium`)
- [x] ES6+ enabled (`<transpile>true</transpile>`)

## Installation

1. Via npm: `npm i ti.growingform`
2. Manually: Copy to `app/lib/` (Alloy) or `Resources/` (classic)

## Example

```js
import { GrowingForm, GrowingFormFieldType } from 'ti.growingform';

const config = {
	cells: [{
		title: 'Your Username',
		identifier: 'username',
		type: GrowingFormFieldType.TEXT,
		validate: GrowingFormValidationRule.NOT_EMPTY,
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
		// backgroundColor: 'green',
		top: 50
	} 
};

const growingForm = new GrowingForm({ configuration: config });

growingForm.on('submit', data => {
	Ti.API.info(`Finished form! Data: ${JSON.stringify(data)}`)
});

growingForm.on('step', index => {
	Ti.API.info(`Stepped to ${index}`)
});

growingForm.render({ view: $.index });
```

## License

MIT

## Author

Hans Knöchel (Lambus GmbH)
