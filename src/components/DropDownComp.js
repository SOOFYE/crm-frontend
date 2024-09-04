import React, { useState, useRef, useEffect } from 'react';

function DropDown({ options = [], row }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = () => setOpen(!open);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 3a1.5 1.5 0 11-1.5 1.5A1.5 1.5 0 0110 3zm0 6a1.5 1.5 0 11-1.5 1.5A1.5 1.5 0 0110 9zm0 6a1.5 1.5 0 11-1.5 1.5A1.5 1.5 0 0110 15z" />
                </svg>
            </button>

            {open && (
                <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    option.onClick(row);
                                    setOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DropDown;