export function asyncHandler<A, B, C, D, E extends Record<string, any>>(
	requestHandler: import('express').RequestHandler<A, B, C, D, E>
): import('express').RequestHandler<A, B, C, D, E> {
	return (request, response, next) => {
		try {
			const p = requestHandler(request, response, next);
			if (p instanceof Promise) {
				p.catch(next);
			}
		} catch (e) {
			// in case a sync function is passed in
			next(e);
		}
	};
}
