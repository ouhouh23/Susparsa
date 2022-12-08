// Accordeon
class Toggle {
	constructor(element, elementsGroup) {
		this.details = element.parentElement
		this.detailsGroup = elementsGroup

		this.animation = this.createAnimation()
		this.initAction()
	}

	createAnimation() {
		const content = this.details.querySelector('[data-details-content]')
		const contentProperties = window.getComputedStyle(content)
		const contentHeight = contentProperties.getPropertyValue('height')
		const contentPadding = contentProperties.getPropertyValue('padding')

		const keyframes = [
		{
		    height: 0,
		    padding: 0,
		    opacity: 0
		},
		{
		    height: contentHeight,
		    padding: contentPadding,
		    opacity: 1
		}]

		const options = {
		    duration: 400,
		    easing: 'ease-in'
		}

		content.style.overflow = 'hidden'

		return content.animate(keyframes, options)
	}

	collapse() {
		this.animation.reverse()
		this.animation.finished.then(() => {
			this.details.open = false
		})
	}

	collapseSibling() {
		const detailsOpen = this.detailsGroup.querySelector('[open]')

		if (detailsOpen == null) {
			return
		}

		const summaryOpen = detailsOpen.querySelector('[data-summary]')

		const toggle = new Toggle(summaryOpen)
	}

	expand()  {
		this.collapseSibling()
		this.details.open = true
		this.animation.play()
	}

	initAction () {
		if (this.details.open) {
			this.collapse()
		}

		else {
			this.expand()
		}
	}		
}


class Accordeon {
	constructor(element) {
		this.detailsGroup = element

		this.initEvents()
	}

	initEvents() {
		this.detailsGroup.addEventListener('click', (event) => {
			this.summary = event.target.closest('[data-summary]')

			if (this.summary) {
				event.preventDefault()
				this.toggle = new Toggle(this.summary, this.detailsGroup)
			}
		})		
	}
}

// const toggle = (summary) => {
// 	const details = summary.parentElement

// 	const createAnimation = () => {

// 		const content = details.querySelector('[data-details-content]')
// 		const contentProperties = window.getComputedStyle(content)
// 		const contentHeight = contentProperties.getPropertyValue('height')
// 		const contentPadding = contentProperties.getPropertyValue('padding')

// 		const keyframes = [
// 		{
// 		    height: 0,
// 		    padding: 0,
// 		    opacity: 0
// 		},
// 		{
// 		    height: contentHeight,
// 		    padding: contentPadding,
// 		    opacity: 1
// 		}]

// 		const options = {
// 		    duration: 400,
// 		    easing: 'ease-in'
// 		}

// 		content.style.overflow = 'hidden'

// 		return content.animate(keyframes, options)
// 	}

// 	const animation = createAnimation()

// 	const collapse = () => {
// 		console.log('initCollapse')
// 		animation.reverse()
// 		animation.finished.then(() => {
// 			details.open = false
// 		})
// 	}

// 	const collapseSibling = () => {
// 		const detailsOpen = detailsGroup.querySelector('[open]')
// 		if (detailsOpen == null) {
// 			return
// 		}

// 		const summaryOpen = detailsOpen.querySelector('[data-summary]')
// 		toggle(summaryOpen)
// }

// 	const expand = () => {
// 		console.log('initExpand')
// 		collapseSibling()
// 		details.open = true
// 		animation.play()
// 	}

// 	const initToggle = () => {
// 		if (details.open) {
// 			collapse()
// 		}

// 		else {
// 			expand()
// 		}
// 	}

// 	initToggle()
// }

// const detailsGroup = document.querySelector('[data-details-group]')

// detailsGroup.addEventListener('click', (event) => {
// 	const summary = event.target.closest('[data-summary]')
// 	if (summary) {
// 		event.preventDefault()
// 		console.log(summary.parentElement)
// 		toggle(summary)
// 	}
// })


class Value {
	constructor(initilalValue = null, min = -Infinity, max = Infinity) {
		this.value = initilalValue
		this.min = min
		this.max = max

		this.eventTarget = new EventTarget()
	}

	dispatchEvent(eventName) {
		this.eventTarget.dispatchEvent(new Event(eventName))
	}

	addEventListener(event, callback) {
		this.eventTarget.addEventListener(event, callback)
	}

	getValue() {
		return this.value
	}

	clamp(value) {
		return Math.min(Math.max(this.min, value), this.max)
	}

	setValue(incomeValue) {
		this.value = incomeValue
		this.dispatchEvent('changedValue')
	}

	setClampedValue(incomeValue) {
		this.value = this.clamp(incomeValue)
		this.dispatchEvent('changedValue')
	}
}

class CounterValue extends Value {
	constructor(initilalValue = null, step = 1, min = -Infinity, max = Infinity) {
		super(initilalValue, min, max)

		this.step = step
	}

	increase() {
		this.setClampedValue(this.value + this.step)
	}

	decrease() {
		this.setClampedValue(this.value - this.step)
	}
}

class InputCounter {
	constructor(element, initilalValue = null, step = 1, min = -Infinity, max = Infinity) {
		this.counterValue = new CounterValue(initilalValue, step, min, max)

		this.step = step
		this.min = min
		this.max = max	

		this.element = element
		this.inputElement = this.element.querySelector('[data-input]');
 	    this.decreaseElement = this.element.querySelector('[data-decrease]');
 	    this.increaseElement = this.element.querySelector('[data-increase]');

 	    this.initInput()
 	    this.initEvents()

	}

	render() {
	    const value = this.counterValue.getValue()

    	this.inputElement.value = value
    	this.decreaseElement.disabled = (value == this.min)
    	this.increaseElement.disabled = (value == this.max) 
	}

    initInput() {
    	this.inputElement.step = this.step
    	this.inputElement.max = this.max
    	this.inputElement.min = this.min

    	this.render()
    }

    initEvents() {
    	this.inputElement.addEventListener('change', (event) => {
    		this.counterValue.setClampedValue(event.target.value)
    	})

	    this.increaseElement.addEventListener('click', this.counterValue.increase.bind(this.counterValue))
	    this.decreaseElement.addEventListener('click', this.counterValue.decrease.bind(this.counterValue))

	    this.counterValue.addEventListener('changedValue', this.render.bind(this))
    }

}

class CartCounter {
	constructor(element, initilalValue = null, min = -Infinity, max = Infinity) {
		this.cartValue = new Value(initilalValue, min, max)

		this.element = document.querySelector(element)

		this.render()
		this.initEvents()
	}

	render() {
		this.value = this.cartValue.getValue()

		this.element.innerHTML = this.value
	}

	acceptValue(value) {
		if (value !== 0) {
			this.cartValue.setClampedValue(this.value + value)
		}
	}

	initEvents() {
		this.cartValue.addEventListener('changedValue', this.render.bind(this))
	}
}

class ColorIndicator {
	constructor(initilalValue = null, element) {
		this.colorValue = new Value(initilalValue)

		this.element = element

		this.setCheckedValue()
		this.render()
		this.initEvents()
	}

	setCheckedValue() {
		const checkedInput = this.element.querySelector(':checked')

		this.colorValue.setValue(checkedInput.value)
	}

	render() {
		const value = this.colorValue.getValue()
		const elementColor = this.element.querySelector('[data-color]')

		elementColor.innerHTML = value
	}

	initEvents() {
		this.element.addEventListener('change', (event) => {
			if (event.target.closest('[data-color-input]')) {
				this.setCheckedValue()
			}
		})

		this.colorValue.addEventListener('changedValue', this.render.bind(this))
	}
}

class Form {
	constructor(element) {
		this.form = element
		this.formButtonAdd = this.form.querySelector('[data-button-add]')
		this.formButtonBuy = this.form.querySelector('[data-button-buy]')

		this.initEvents()
	}

	initFormData() {
		this.formData = new FormData(this.form)

		this.formSizeValue = this.formData.get('size-input')
		this.formColorValue = this.formData.get('color-input')
		this.formQuantityValue = Number(this.formData.get('quantity-input'))
	}

	initEvents() {
		this.form.addEventListener('submit', (event) => {
			event.preventDefault()
		})

		this.formButtonBuy.addEventListener('click', this.initFormData.bind(this))
		this.formButtonAdd.addEventListener('click', () => {
			this.initFormData()
			cartCounter.acceptValue(this.formQuantityValue)
		})
	}
}


const cartCounter = new CartCounter('[data-cart-counter]', 0, 0)

const colorGroups = document.querySelectorAll('[data-color-group]')
colorGroups.forEach(element => {
	const colorIndicator = new ColorIndicator(null, element)
})

const dataCounters = document.querySelectorAll('[data-counter]')
dataCounters.forEach(element => {
	const inputCounter = new InputCounter(element, 1, 1, 0, 11)
})

const dataForms = document.querySelectorAll('[data-form]')
dataForms.forEach(element => {
	const form = new Form(element)
})

const detailsGroups = document.querySelectorAll('[data-details-group]')
detailsGroups.forEach(element => {
	const accordeon = new Accordeon(element)
})
