/**
 * BOOST Validator - Application Entry Point
 * Initialize the validator when the page loads
 */
import { BOOSTValidator } from './BOOSTValidator.js';

// Initialize the validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.boostValidator = new BOOSTValidator();
});