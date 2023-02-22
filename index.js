// Accordion
class Toggle {
  constructor(element) {
    this.details = element;
    this.details.open = false;
    this.summary = this.details.querySelector('[data-summary]');

    this.eventTarget = new EventTarget();
    this.createAnimation();
    this.initEvents();
  }

  dispatchEvent(type, detail) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, {detail}));
  }

  addEventListener(event, callback) {
    this.eventTarget.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    this.eventTarget.removeEventListener(event, callback);
  }

  createAnimation() {
    this.content = this.details.querySelector('[data-details-collapse]');
    const contentProperties = document.defaultView.getComputedStyle(
      this.content,
    );
    const contentHeight = contentProperties.getPropertyValue('height');
    const contentPadding = contentProperties.getPropertyValue('padding');

    const keyframes = [
      {
        height: 0,
        padding: 0,
        opacity: 0,
      },
      
      {
        height: contentHeight,
        padding: contentPadding,
        opacity: 1,
      },
    ];

    const options = {
      duration: 400,
      easing: 'ease-in',
    };

    const keyframeEffect = new KeyframeEffect(this.content, keyframes, options);

    this.animation = new Animation(keyframeEffect);
  }

  updateAnimationHeight() {
    const animationKeyframes = this.animation.effect.getKeyframes();
    animationKeyframes[1].height = document.defaultView
      .getComputedStyle(this.content)
      .getPropertyValue('height');
    this.animation.effect.setKeyframes(animationKeyframes);
  }

  expand() {
    this.details.open = true;
    this.animation.play();
  }

  collapse() {
    this.animation.reverse();
    this.animation.finished.then(() => {
      this.animation.reverse();
      this.animation.pause();
      this.details.open = false;
    });
  }

  toggleAction() {
    if (this.animation.playState === 'running') return;
    this.updateAnimationHeight();

    if (this.details.open) {
      this.collapse();
      this.dispatchEvent('toggle:closed');
    } else {
      this.expand();
      this.dispatchEvent('toggle:opened', {target: this});
    }
  }

  initEvents() {
    this.summary.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleAction();
    });
  }
}

class Accordion {
  constructor(element) {
    this.toggles = Array.from(
      element.querySelectorAll('[data-details]'),
      (item) => {
        const toggle = new Toggle(item);
        this.initEvents(toggle);
        return toggle;
      },
    );
  }

  refresh(event) {
    if (this.activeToggleIndex >= 0) {
      this.toggles[this.activeToggleIndex].collapse();
    }

    this.activeToggleIndex = this.toggles.indexOf(event.detail.target);
  }

  resetActiveToggleIndex() {
    this.activeToggleIndex = -1;
  }

  initEvents(toggle) {
    toggle.addEventListener('toggle:opened', this.refresh.bind(this));
    toggle.addEventListener(
      'toggle:closed',
      this.resetActiveToggleIndex.bind(this),
    );
  }

  destroyEvents() {
    this.toggles.forEach((element) => {
      element.removeEventListener('toggle:opened', this.refresh.bind(this));
      element.removeEventListener(
        'toggle:closed',
        this.resetActiveToggleIndex.bind(this),
      );
    });
  }
}

// Counter
class Counter {
  constructor(initilalValue = null, step = 1, min = -Infinity, max = Infinity) {
    this.value = initilalValue;
    this.step = step;
    this.min = min;
    this.max = max;

    this.eventTarget = new EventTarget();
  }

  dispatchEvent(eventName) {
    this.eventTarget.dispatchEvent(new Event(eventName));
  }

  addEventListener(event, callback) {
    this.eventTarget.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    this.eventTarget.removeEventListener(event, callback);
  }

  getValue() {
    return this.value;
  }

  clamp(value) {
    return Math.min(Math.max(this.min, value), this.max);
  }

  setClampedValue(incomeValue) {
    this.value = this.clamp(incomeValue);
    this.dispatchEvent('value:changed');
  }

  increase() {
    this.setClampedValue(this.value + this.step);
  }

  decrease() {
    this.setClampedValue(this.value - this.step);
  }
}

class CounterInput {
  constructor(
    element,
    initilalValue = null,
    step = 1,
    min = -Infinity,
    max = Infinity,
  ) {
    this.counter = new Counter(initilalValue, step, min, max);

    this.step = step;
    this.min = min;
    this.max = max;

    this.element = element;
    this.inputElement = this.element.querySelector('[data-input]');
    this.decreaseElement = this.element.querySelector('[data-decrease]');
    this.increaseElement = this.element.querySelector('[data-increase]');

    this.initInput();
    this.initEvents();
  }

  render() {
    const value = this.counter.getValue();

    this.inputElement.value = value;
    this.decreaseElement.disabled = (value == this.min);
    this.increaseElement.disabled = (value == this.max);
  }

  initInput() {
    this.inputElement.step = this.step;
    this.inputElement.max = this.max;
    this.inputElement.min = this.min;

    this.render();
  }

  initEvents() {
    this.inputElement.addEventListener('change', (event) => {
      this.counter.setClampedValue(event.target.value);
    });

    this.increaseElement.addEventListener(
      'click',
      this.counter.increase.bind(this.counter),
    );
    this.decreaseElement.addEventListener(
      'click',
      this.counter.decrease.bind(this.counter),
    );

    this.counter.addEventListener('value:changed', this.render.bind(this));
  }

  destroyEvents() {
    this.counter.removeEventListener('value:changed', this.render.bind(this));
  }
}

//Cart
class Cart {
  constructor(element) {
    this.cart = document.querySelector(element);
    this.initEvents();
  }

  updateCart(event) {
  	const cartValue = Number(this.cart.innerHTML)
    const cartIncrement = event.detail.quantity
    this.cart.innerHTML = cartValue + cartIncrement
  }

  initEvents() {
    document.addEventListener('AddItemsToCart', this.updateCart.bind(this));
  }

  destroyEvents() {
    document.removeEventListener('AddItemsToCart', this.updateCart.bind(this));
  }
}


// Form
class Form {
  constructor(element) {
	this.form = element

	this.initEvents()
  }

  initFormData() {
	this.formData = new FormData(this.form)
	this.formQuantityValue = Number(this.formData.get('quantity-input'))
  }

  dispatchQuantity() {
	const event = new CustomEvent('AddItemsToCart', {
	  detail: {
	    quantity: this.formQuantityValue,
	  },
	  bubbles: true,
	  })
	  this.form.dispatchEvent(event)
  }

  initEvents() {
	this.form.addEventListener('submit', (event) => {
	  event.preventDefault()
	  this.initFormData()
	  this.dispatchQuantity()
	})
  }
}

// Color pick
class ColorPicker {
  constructor(element) {
	this.element = element

	this.initEvents()
  }

  setColorValue() {
	const elementColor = this.element.querySelector('[data-color]')
	const checkedInput = this.element.querySelector(':checked')

	elementColor.innerHTML = checkedInput.value
  }

  initEvents() {
	this.element.addEventListener('change', (event) => {
	  if (event.target.closest('[data-color-input]')) {
	    this.setColorValue()
	  }
	})
  }
}

//Init 
const cartElement = document.querySelector('[data-cart-counter')
if (cartElement !== null) {
  cart = new Cart('[data-cart-counter]')
}

const colorGroups = document.querySelectorAll('[data-color-group]')
colorGroups.forEach(element => {
  const colorPicker = new ColorPicker(element)
})

const counters = document.querySelectorAll('[data-counter]')
counters.forEach(element => {
  const counterInput = new CounterInput(element, 1, 1, 0, 11)
})

const forms = document.querySelectorAll('[data-form]')
forms.forEach(element => {
  const form = new Form(element)
})

const accordions = document.querySelectorAll('[data-accordion]')
accordions.forEach(element => {
  const accordion = new Accordion(element)
})
