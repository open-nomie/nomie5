/**
 * PromiseStep
 * Like promise.all, but one at a time.
 *
 * PromiseStep([1,2,3], (row)=>{
 *     return Promise.resolve(row)
 * }, (status)=>{
 *     console.log("Status", status)
 * }).then((finished)=>{
 *    console.log("All Done", finished);
 * })
 *
 */

export default (rows, promiseFunction, onChange) => {
	onChange = onChange || function() {}; // a status callback
	return new Promise((resolve, reject) => {
		let finished = [];
		// Create recurisve function to run
		let run = () => {
			// if finished is less than rows, we should run again.
			if (finished.length < rows.length) {
				// fire on change
				onChange({ step: finished.length, total: rows.length, done: false });
				// Fire off promise function
				promiseFunction(rows[finished.length])
					.then(res => {
						// push results to finished
						finished.push(res);
						// run again
						run();
					})
					.catch(e => {
						// push error to finished - so we continue the flow
						finished.push(e.message);
						// run again
						run();
					});
			} else {
				// Finished running all steps
				onChange({ step: finished.length, total: rows.length, done: true });
				// done
				resolve(finished);
			}
		};
		// Kick off initial run
		run();
	});
};
