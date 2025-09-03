import { useEffect } from 'react';

/**
 * Custom hook for Google Places Autocomplete.
 * Attaches a Google Places Autocomplete instance to a specified input element.
 *
 * @param {React.RefObject<HTMLInputElement>} inputRef A ref object pointing to the input element.
 * @param {(address: string) => void} setAddress A state setter function to update the address.
 */
export const useGooglePlacesAutocomplete = (inputRef, setAddress) => {
  useEffect(() => {
    // Check if Google Maps Places library is loaded
    // This is crucial for the autocomplete functionality to work.
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps JavaScript API with Places library not loaded. Autocomplete will not function.");
      // You might want to handle this gracefully in your UI,
      // e.g., by disabling the input or showing a message to the user.
      return;
    }

    if (inputRef.current) {
      // Initialize Google Places Autocomplete on the provided input element.
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'], // Restrict prediction results to addresses.
        componentRestrictions: { country: ["in"] } // Example: restrict suggestions to India.
      });

      // Add a listener to capture the selected place's details.
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          // If a formatted address is available, use it.
          setAddress(place.formatted_address);
        } else if (place.name) {
          // Fallback to the place name if formatted_address is not provided.
          setAddress(place.name);
        }
      });

      // Cleanup function for the effect.
      // While Google Places Autocomplete instances generally clean up well with DOM removal,
      // this return ensures proper React lifecycle management.
      return () => {
        // No explicit 'destroy' method for Google Places Autocomplete is usually needed here.
        // The event listener is tied to inputRef.current which React manages.
      };
    }
  }, [inputRef, setAddress]); // Dependencies: inputRef (the DOM element) and setAddress (the state updater).
};
