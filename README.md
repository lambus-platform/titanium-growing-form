# Growing ("Stepper") Form for Titanium

<img src="./screenshots/screenshot.png" width="900" alt="Example" />

A form that expands / collapses based on the current input field. Also known as "growing form" or "stepper form".

⚠️ This project is currently work in progress and should not be used in production so far.

## Requirements

- [x] Titanium SDK (`npm i titanium`)
- [x] ES6+ enabled (`<transpile>true</transpile>`)

## Example

```js
import { GrowingForm, GrowingFormFieldType } from 'ti.growingform';

const config = {
	cells: [{
		title: 'Your Username',
		identifier: 'username',
		type: GrowingFormFieldType.TEXT,
		options: {
			hintText: 'Enter username ...'
		}
	}, {
		title: 'Your Mail address',
		identifier: 'email',
		type: GrowingFormFieldType.TEXT,
		options: {
			keyboardType: Ti.UI.KEYBOARD_TYPE_EMAIL,
			hintText: 'Enter mail address ...'
		}
	}, {
		title: 'Your Password',
		identifier: 'password',
		type: GrowingFormFieldType.TEXT,
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