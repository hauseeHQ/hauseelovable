import { useEffect, useRef, useState } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

export default function DualRangeSlider({
  min,
  max,
  step,
  minValue,
  maxValue,
  onChange,
}: DualRangeSliderProps) {
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMinValue(minValue);
    setLocalMaxValue(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMaxValue - step);
    setLocalMinValue(value);
    onChange(value, localMaxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMinValue + step);
    setLocalMaxValue(value);
    onChange(localMinValue, value);
  };

  const minPercent = ((localMinValue - min) / (max - min)) * 100;
  const maxPercent = ((localMaxValue - min) / (max - min)) * 100;

  return (
    <div className="relative w-full">
      <div className="relative h-2 bg-gray-200 rounded-lg" ref={rangeRef}>
        <div
          className="absolute h-full bg-primary-400 rounded-lg"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
      </div>

      <input
        ref={minRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localMinValue}
        onChange={handleMinChange}
        className="absolute w-full h-2 -top-0 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-400 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
        style={{ zIndex: localMinValue > max - (max - min) / 2 ? 5 : 3 }}
      />

      <input
        ref={maxRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localMaxValue}
        onChange={handleMaxChange}
        className="absolute w-full h-2 -top-0 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-400 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}
