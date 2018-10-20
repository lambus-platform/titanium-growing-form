# Growing ("Stepper") Form for Titanium

A form that expands / collapses based on the current input field. Also known as "growing form" or "stepper form".

⚠️ This project is currently work in progress and should not be used in production so far.

## Requirements

- [x] Titanium SDK (`npm i titanium`)
- [x] ES6+ enabled (`<transpile>true</transpile>`)

## Example

```js
import { GrowingForm, GrowingFormFieldType } from 'ti.growingform'

const config = {
	cells: [{
		title: 'Enter Username',
		type: GrowingFormFieldType.TEXT,
		options: {
			hintText: 'Your username ...'
		}
	}, {
		title: 'Enter Mail',
		type: GrowingFormFieldType.TEXT,
		options: {
			keyboardType: Ti.UI.KEYBOARD_TYPE_EMAIL,
			hintText: 'Your mail ...'
		}
	}],
	overrides: {
		// backgroundColor: 'green'
	} 
}

const growingForm = new GrowingForm({ configuration: config });
growingForm.render({ view: $.index });
```

## License

MIT

## Author

Hans Knöchel (Lambus GmbH)