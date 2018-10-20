# Growing ("Stepper") Form for Titanium

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
		type: GrowingFormFieldType.TEXT,
		options: {
			hintText: 'Enter username ...'
		}
	}, {
		title: 'Your Mail address',
		type: GrowingFormFieldType.TEXT,
		options: {
			keyboardType: Ti.UI.KEYBOARD_TYPE_EMAIL,
			hintText: 'Enter mail address ...'
		}
	}, {
		title: 'Your Password',
		type: GrowingFormFieldType.TEXT,
		options: {
			passwordMask: true,
			hintText: 'Enter password ...'
		}
	}],
	overrides: {
		// backgroundColor: 'green'
	} 
}

const growingForm = new GrowingForm({ configuration: config });

growingForm.on('submit', (data, err) => {
	if (err) throw err;

	Ti.API.info(`Finished form! Data: ${data}`)
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