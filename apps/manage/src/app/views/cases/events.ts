export const EVENT_TYPES = Object.freeze({
	PUBLIC: 'public',
	INTERNAL: 'internal'
});

export type EVENT_TYPES_VALUES = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const EVENT_TYPE_NAMES = Object.freeze({
	PUBLIC: 'Public event',
	INTERNAL: 'Internal event'
});
