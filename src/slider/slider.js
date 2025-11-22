import './slider.scss';

class RangeSlider {
	constructor() {
		this.setClasses();
		this.findRangeSlider();
	}

	setClasses() {
		this.RSSelector = ".js-range-slider";
		this.RSPrice = ".js-range-slider__price";
		this.RSProgress = ".js-range-slider__progress";
		this.RSValue = ".js-range-slider__value"
	}

	findRangeSlider() {
		this.rangeSlider = document.querySelectorAll(this.RSSelector)
	}

	init() {
		this.rangeSlider.forEach(item => {
			const priceMin = item.querySelector(`${this.RSPrice}[data-limit="min"]`);
			const priceMax = item.querySelector(`${this.RSPrice}[data-limit="max"]`);
			const rangeProgress = item.querySelector(this.RSProgress);
   		const rangeValueMin = item.querySelector(`${this.RSValue}[data-value="min"]`);
   		const rangeValueMax = item.querySelector(`${this.RSValue}[data-value="max"]`);

			this.updateRange(rangeValueMin, rangeValueMax, priceMin, priceMax, rangeProgress);

			rangeValueMax.addEventListener('input', () => {
				this.validateMax(rangeValueMin, rangeValueMax);
				this.updateRange(rangeValueMin, rangeValueMax, priceMin, priceMax, rangeProgress)
			});

			
			rangeValueMin.addEventListener('input', () => {
				this.validateMin(rangeValueMin, rangeValueMax);
				this.updateRange(rangeValueMin, rangeValueMax, priceMin, priceMax, rangeProgress)
			});
		})
	}

	updateRange = (valueMin, valueMax, priceMin, priceMax, progress) => {
    const minVal = parseInt(valueMin.value);
    const maxVal = parseInt(valueMax.value);

    priceMin.textContent = minVal + "₽";
    priceMax.textContent = maxVal + "₽";

    const progressLeft = ((minVal / valueMin.max) * 100) + "%";
    const progressRight = 100 - ((maxVal / valueMax.max) * 100) + "%";

    progress.style.left = progressLeft;
    progress.style.right = progressRight;
   };

	validateMin(minInput, maxInput) {
			const minVal = parseInt(minInput.value);
			const maxVal = parseInt(maxInput.value);

			if (minVal > maxVal) {
					minInput.value = maxVal;
			}
	}

	validateMax(minInput, maxInput) {
		const minVal = parseInt(minInput.value);
		const maxVal = parseInt(maxInput.value);

		if (maxVal < minVal) {
				maxInput.value = minVal;
		}
	}

}

export default RangeSlider