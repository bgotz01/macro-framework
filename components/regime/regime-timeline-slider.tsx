'use client';

interface TimelineSliderProps {
    sliderValue: number;
    totalMonths: number;
    startYear: number;
    currentYear: number;
    displayDate: string;
    onSliderChange: (value: number) => void;
}

export default function TimelineSlider({
    sliderValue,
    totalMonths,
    startYear,
    currentYear,
    displayDate,
    onSliderChange
}: TimelineSliderProps) {
    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Timeline</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSliderChange(Math.max(0, sliderValue - 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === 0}
                    >
                        −
                    </button>
                    <div className="text-sm font-semibold text-primary min-w-[100px] text-center">{displayDate}</div>
                    <button
                        onClick={() => onSliderChange(Math.min(totalMonths, sliderValue + 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === totalMonths}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Timeline Slider */}
            <div>
                <div className="relative">
                    <div className="absolute -top-2 left-0 right-0 h-2 pointer-events-none">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map(year => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <div key={year} className={`absolute w-0.5 h-3 transition-colors ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ left: `${position}%` }} />
                            );
                        })}
                    </div>
                    <div className="relative">
                        <div className="absolute top-0 left-0 h-[8px] bg-primary rounded-l-full pointer-events-none z-0" style={{ width: `${(sliderValue / totalMonths) * 100}%` }} />
                        {/* Vertical line indicator at the end of progress bar */}
                        <div
                            className="absolute -top-3 w-[2px] h-[32px] bg-primary pointer-events-none z-20 transition-all duration-100 shadow-md"
                            style={{
                                left: `${(sliderValue / totalMonths) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                        <input type="range" min={0} max={totalMonths} value={sliderValue} onChange={(e) => onSliderChange(Number(e.target.value))} className="w-full range-slider relative z-10" />
                    </div>
                    <div className="relative mt-1 h-4">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map((year) => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <button key={year} onClick={() => onSliderChange(monthsFromStart)} className={`absolute cursor-pointer hover:text-primary transition-colors text-[10px] font-medium -translate-x-1/2 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`} style={{ left: `${position}%` }}>
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: hsl(var(--muted));
                    outline: none;
                    cursor: pointer;
                    position: relative;
                }
                .range-slider::-webkit-slider-track { 
                    -webkit-appearance: none; 
                    width: 100%; 
                    height: 8px; 
                    border-radius: 4px; 
                    background: transparent; 
                }
                .range-slider::-webkit-slider-thumb { 
                    -webkit-appearance: none; 
                    width: 3px; 
                    height: 32px; 
                    border-radius: 2px; 
                    background: hsl(var(--primary)); 
                    cursor: grab; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                    transition: all 0.2s;
                    position: relative;
                    z-index: 10;
                }
                .range-slider::-webkit-slider-thumb:hover { 
                    width: 4px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4); 
                }
                .range-slider::-webkit-slider-thumb:active { 
                    cursor: grabbing; 
                    width: 4px;
                }
                .range-slider::-moz-range-track { width: 100%; height: 8px; border-radius: 4px; background: hsl(var(--muted)); }
                .range-slider::-moz-range-progress { height: 8px; border-radius: 4px; background: hsl(var(--primary)); }
                .range-slider::-moz-range-thumb { 
                    width: 3px; 
                    height: 32px; 
                    border-radius: 2px; 
                    background: hsl(var(--primary)); 
                    cursor: grab; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                    transition: all 0.2s;
                    border: none;
                }
                .range-slider::-moz-range-thumb:hover { 
                    width: 4px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4); 
                }
                .range-slider::-moz-range-thumb:active { 
                    cursor: grabbing; 
                    width: 4px;
                }
            `}</style>
        </div>
    );
}
