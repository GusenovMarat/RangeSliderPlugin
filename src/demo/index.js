import './styles/global.scss';

import RangeSlider from "../slider/slider";

document.addEventListener("DOMContentLoaded",() => {
  const rangeSlider  = new RangeSlider();
  rangeSlider.init();
})