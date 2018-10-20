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
		bulletInactiveBackgroundColor: '#666',
		bulletActiveBackgroundColor: '#000',
		stepButtonBackgroundColor: '#333',
		submitButtonBackgroundColor: 'orange'
	},
	overrides: {
		// backgroundColor: 'green'
	} 
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

## License

MIT

## Author

Hans Knöchel (Lambus GmbH)