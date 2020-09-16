- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< .&__content
			< h1
				Hello V4Fire!

			< button.&__button @click = increaseCounter
				Increase Counter

				< .&__counter
					{{ counter }}
