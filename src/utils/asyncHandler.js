/**
 * ASYNC HANDLER - Higher Order Function for Error Handling
 * 
 * This is a Higher-Order Function (HOF) because it:
 * 1. Takes a function (requestHandler) as an argument
 * 2. Returns a new function with enhanced capabilities
 * 
 * Purpose: Eliminates the need for try-catch blocks in every async route handler
 * 
 * How Higher-Order Functions work:
 * - They operate on other functions, either by taking them as arguments or returning them
 * - This creates powerful abstractions and enables function composition
 * - Allows us to "decorate" or "wrap" existing functions with additional behavior
 */

/**
 * @param {Function} requestHandler - The async function we want to wrap with error handling
 * @returns {Function} - A new function that Express can use as middleware/controller
 * 
 * STEP-BY-STEP BREAKDOWN:
 * 
 * 1. PARAMETER: requestHandler
 *    - This is the original async function (controller) that we want to enhance
 *    - It follows Express signature: (req, res, next) => {}
 *    - May contain await calls that could throw errors
 * 
 * 2. RETURN VALUE: A new function
 *    - This returned function is what Express actually calls
 *    - Has the same signature (req, res, next) as the original
 *    - But now includes automatic error handling
 * 
 * 3. CLOSURE CONCEPT:
 *    - The returned function "closes over" the requestHandler parameter
 *    - Even after asyncHandler finishes, the returned function remembers requestHandler
 *    - This is how the wrapper function can still call the original function
 */
const asyncHandler = (requestHandler) => {
    // RETURNED FUNCTION: This is what Express calls when the route is hit
    // The fact that we return a function makes this a Higher-Order Function
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
}

/**
 * PROMISE.RESOLVE() EXPLANATION:
 * - Wraps requestHandler(req, res, next) in a Promise
 * - Even if requestHandler is not async, this makes it behave like one
 * - Ensures consistent error handling for both sync and async functions
 * 
 * EXECUTION FLOW:
 * 1. Promise.resolve() calls requestHandler with Express parameters
 * 2. If requestHandler succeeds: Promise resolves normally
 * 3. If requestHandler throws/rejects: .catch() intercepts the error
 * 4. .catch() calls next(err) to pass error to Express error middleware
 * 
 * WHY THIS WORKS:
 * - Any unhandled error in an async function becomes a rejected Promise
 * - Promise.resolve() catches both thrown errors and rejected Promises
 * - .catch() ensures errors are always passed to Express error handling
 * 
 * EXAMPLE WITHOUT asyncHandler:
 * const getUser = async (req, res, next) => {
 *     try {
 *         const user = await User.findById(req.params.id);
 *         res.json(user);
 *     } catch (error) {
 *         next(error); // Manual error handling required
 *     }
 * };
 * 
 * EXAMPLE WITH asyncHandler:
 * const getUser = asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.params.id);
 *     res.json(user);
 *     // No try-catch needed! asyncHandler handles errors automatically
 * });
 */
/**
 * HIGHER-ORDER FUNCTION CONCEPTS DEMONSTRATED:
 * 
 * 1. FUNCTION AS ARGUMENT:
 *    - asyncHandler accepts requestHandler as a parameter
 *    - This makes it a Higher-Order Function by definition
 * 
 * 2. FUNCTION AS RETURN VALUE:
 *    - Returns a new function that wraps the original
 *    - The new function has enhanced error handling capabilities
 * 
 * 3. FUNCTION COMPOSITION:
 *    - Combines error handling logic with business logic
 *    - Creates a new function from existing functions
 * 
 * 4. ABSTRACTION:
 *    - Hides complex error handling behind a simple interface
 *    - Developers can focus on business logic, not error boilerplate
 * 
 * 5. DECORATOR PATTERN:
 *    - "Decorates" the original function with additional behavior
 *    - Original function remains unchanged, enhancement is external
 * 
 * REAL-WORLD USAGE:
 * 
 * // In controller file:
 * import { asyncHandler } from '../utils/asyncHandler.js';
 * 
 * // Wrap any async controller:
 * const createVideo = asyncHandler(async (req, res) => {
 *     const video = await Video.create(req.body);
 *     res.status(201).json(video);
 * });
 * 
 * const getUserVideos = asyncHandler(async (req, res) => {
 *     const videos = await Video.find({ owner: req.user.id });
 *     res.json(videos);
 * });
 * 
 * // In routes file:
 * router.post('/videos', createVideo);
 * router.get('/my-videos', getUserVideos);
 * 
 * // All errors automatically handled by asyncHandler!
 */

export { AsyncHandler };